import React, {useEffect, useRef, useState} from 'react'
import MUIDataTable from "mui-datatables";
import Button from "@material-ui/core/Button";
import Radio from "@material-ui/core/Radio";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {MuiTableOptions} from "../../../../theme/overrides/MuiTable";
import {useDispatch, useSelector} from "react-redux";
import {
    createBusinessProcess,
    createBusinessProcessLink,
    getBusinessProcessParams,
    getBusinessProcessTemplates,
    startBusinessProcess
} from "../../../../redux/function/bp";
import {makeStyles} from "@material-ui/styles";
import {
    Card, CardContent, createMuiTheme, Dialog, IconButton, MuiThemeProvider
} from '@material-ui/core';
import CloseIcon from "@material-ui/icons/Close";
import DialogParameters from "../../DialogParameters/DialogParameters";
import {checkModelData, isValidStartProcessParameters} from "../../Util/validation";
import {getBusinessProcessTasks, notifyUsersAboutBusinessProcessTask} from "../../../../redux/function/bpTask";
import SearchIcon from '@material-ui/icons/Search';
import DialogChooserAttachments from "../../../common/ListChangeTasks/DialogChooserAttachments";
import {getTaskHistoryBusinessProcessInstance} from "../../../../redux/function/bpInstance";

const useStyles = makeStyles(() => ({
    selectToolbarButtons: {
        fontSize: '120%',
        width: 235,
        textTransform: 'none',
        marginLeft: 10
    },
    toolBarBtnLine: {
        position: 'absolute',
        right: 180,
        top: 16
    },
    toolBarBtn: {
        marginLeft: 5
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 3
    },
    dialogScroll: {
        overflow: "auto",
        minHeight: 200
    },
    hidden: {
        height: "0",
        overflow: "hidden"
    }
}))

const BusinessProcessTemplateList = () => {

    const classes = useStyles();
    const dispatch = useDispatch()

    const [selectedRow, setSelectedRow] = useState(null)
    const [currentTemplate, setCurrentTemplate] = useState(null)
    const [modeler, setModeler] = useState(null)
    const [arParams, setArParams] = useState([])
    const [tasks, setTasks] = useState([])
    const [isOpenDialogParams, setIsOpenDialogParams] = useState(false);
    const [isOpenDialogDiagram, setIsOpenDialogDiagram] = useState(false);
    const businessProcess = useSelector(state => state.businessProcessData.businessProcess)
        .filter(bp => !bp.archive)
    const currentLoggedInUser = useSelector(state => state.authData.currentLoggedInUser)
    const canUserStartProcesses = currentLoggedInUser.availableActions.includes("WF_START");

    const SVGelem = useRef()
    const bpmnviewInstance = useRef()

    useEffect(() => {
        dispatch(getBusinessProcessTemplates())
    }, [])

    useEffect(() => {
        if (bpmnviewInstance?.current && modeler === null) {
            setModeler(new BpmnModeler({
                container: bpmnviewInstance.current
            }))
        }
        if (modeler && currentTemplate && isOpenDialogDiagram) {
            importXML()
        }
    }, [isOpenDialogDiagram])

    MuiTableOptions.overrides = {
        ...MuiTableOptions.overrides,
        MuiTableRow: {
            root: {
                '&$selected': {
                    backgroundColor: '#8080806b',
                    '&:hover': {
                        backgroundColor: '#80808021'
                    }
                }
            }
        },
        MUIDataTableToolbar: {
            actions: {
                paddingTop: 0
            },
            left: {
                alignSelf: 'start',
                marginTop: 15

            }
        },
        MUIDataTableSearch: {
            main: {
                position: "relative",
                maxWidth: 400
            }
        }
    }
    const getMuiTheme = () => createMuiTheme(MuiTableOptions)

    const handleRadioSelect = (evt, tableMeta) => {
        if (tableMeta.rowIndex === selectedRow) {
            setSelectedRow(null)
            setCurrentTemplate(null)
        } else {
            const template = businessProcess.find(bp => bp.bpId === tableMeta.rowData[0])
            setSelectedRow(tableMeta.rowIndex)
            setCurrentTemplate(template)
        }
    }

    const columns = [
        {
            name: 'bpId',
            label: '№',
            options: {
                filter: false,
                sort: false,
                display: false,
                viewColumns: false,
                searchable: false,
                setCellProps: () => ({style: {width: 40, textAlign: 'center'}})
            }
        },
        {
            name: 'camundaUuid',
            label: '',
            viewColumns: false,
            options: {
                filter: false,
                sort: false,
                display: false,
                viewColumns: false,
                searchable: false
            }
        },
        {
            name: '',
            label: '',
            viewColumns: false,
            options: {
                filter: false,
                sort: false,
                searchable: false,
                viewColumns: false,
                setCellProps: () => ({style: {width: 75}}),
                customBodyRender: (value, tableMeta) => (
                    <Radio
                        checked={selectedRow === tableMeta.rowIndex}
                        onClick={(evt) => handleRadioSelect(evt, tableMeta)}
                        value={tableMeta.rowIndex}
                        color="primary"
                    />
                )
            }
        },
        {
            name: 'name',
            label: 'Наименование шаблона WF',
            options: {
                filter: false,
                sort: true
            }
        },
        {
            name: 'code',
            label: 'Код',
            options: {
                filter: false,
                sort: true
            }
        },
        {
            name: 'ownerFullName',
            label: 'Владелец',
            options: {
                filter: true,
                sort: true,
                setCellProps: () => ({style: {width: 200}})
            }
        },
        {
            name: 'createDate',
            label: 'Дата создания',
            options: {
                filter: false,
                sort: true,
                searchable: false,
                setCellProps: () => ({style: {width: 200}})
            }
        },
        {
            name: '',
            label: '',
            options: {
                filter: false,
                sort: false,
                viewColumns: false,
                searchable: false,
                setCellProps: () => ({style: {width: 40}}),
                customBodyRender: (_, tableMeta) => (
                    <IconButton
                        onClick={() => {
                            const template = businessProcess.find(template => template.bpId === tableMeta.rowData[0])
                            if (template) {
                                setCurrentTemplate(template)
                                setIsOpenDialogDiagram(true)
                            }
                        }}
                        color="primary"
                        title="Посмотреть">
                        <SearchIcon />
                    </IconButton>
                )
            }
        }
    ];

    const options = {
        filterType: 'dropdown',
        textLabels: {
            body: {
                noMatch: "Записей не найдено",
                toolTip: "Сортировать",
                columnHeaderTooltip: column => `Сортировать по "${column.label}"`
            },
            pagination: {
                next: "След. стр",
                previous: "Пред. стр",
                rowsPerPage: "Записей на странице:",
                displayRows: "из"
            },
            toolbar: {
                search: "Поиск",
                downloadCsv: "Скачать CSV",
                print: "Печать",
                viewColumns: "Настройка колонок",
                filterTable: "Фильтровать таблицу"
            },
            filter: {
                all: "Все",
                title: "Фильтры",
                reset: "Сброс"
            },
            viewColumns: {
                title: "Показывать колонки",
                titleAria: "Показывать/Спрятать колонки таблицы"
            },
            selectedRows: {
                text: "ряд(ов) выбран(о)",
                delete: "Удалить",
                deleteAria: "Удалить выбранные ряды"
            }
        },
        responsive: 'scrollMaxHeight',
        selectableRows: 'none',
        rowsPerPage: 20,
        rowsPerPageOptions: [20, 40, 100],
        print: false,
        download: false,
        setRowProps: (rowData) => ({
            onDoubleClick: () => {
                const template = businessProcess.find(template => template.bpId === rowData[0])
                setCurrentTemplate(template)
                setIsOpenDialogDiagram(true)
            }
        }),
        customToolbar: () => (
            canUserStartProcesses
                && (
                    <div className={classes.toolBarBtnLine}>
                        <Button
                            variant="outlined"
                            size="medium"
                            title="Запустить процесс"
                            disabled={!selectedRow && selectedRow !== 0}
                            className={classes.toolBarBtn}
                            onClick={handleStartProcess}>
                        Запустить процесс
                        </Button>
                    </div>
                )
        )
    }

    const importXML = async () => {
        modeler.importXML(currentTemplate.xmlData, (error) => {
            if (error) {
                console.error(`Ошибка загрузки XML файла: ${error}`);
            }
            modeler.saveSVG({}, (err, svg) => {
                if (err) {
                    console.error(`Ошибка конвертации файла: ${err}`);
                }
                SVGelem.current.innerHTML = svg;
            });
        })
    }

    const handleStartProcess = () => {
        const error = checkModelData(currentTemplate.xmlData)
        if (!currentTemplate.name) {
            dispatch(showErrorNotify('Не заполнено поле "Название" для шаблона'))
            return
        }
        if (!currentTemplate.code) {
            dispatch(showErrorNotify('Не заполнено поле "Код" для шаблона'))
            return
        }
        if (error) {
            dispatch(showErrorNotify(error))
            return
        }
        if (arParams.length === 0) {
            dispatch(getBusinessProcessParams())
                .then((params) => {
                    setArParams(params)
                    setIsOpenDialogParams(true)
                })
        } else {
            setIsOpenDialogParams(true)
        }
    }

    const startProcess = (evt, bucket) => {
        // Валидация введенных данных
        const errorMessage = isValidStartProcessParameters(arParams)
        if (errorMessage) {
            dispatch(showErrorNotify(errorMessage))
            return
        }
        // Указана информация о пользователе создающего процесс
        const variables = {
            userId: {type: 'String', value: currentLoggedInUser.userId},
            userName: {type: 'String', value: currentLoggedInUser.fullName},
            startDate: {type: 'String', value: new Date().toLocaleDateString('ru-RU')},
            tasks: {type: 'string', value: JSON.stringify(tasks)}
        };
        for (const param of arParams) {
            if (param.type === 4) {
                variables[param.name] = {
                    value: bucket,
                    type: param.type
                }
            } else {
                variables[param.name] = {
                    value: param.type === 1 ? Number(param.value) : param.value,
                    type: param.type
                }
            }
        }
        if (currentTemplate) {
            const formData = new FormData();
            formData.append('upload', new Blob([currentTemplate.xmlData], {type: 'application/xml'}), 'diagram.bpmn')

            dispatch(createBusinessProcess(formData))
                .then((res) => {
                    if (res.deployedProcessDefinitions) {
                        const key = Object.keys(res.deployedProcessDefinitions)
                        const responseBusinessProcess = res.deployedProcessDefinitions[key[0]]
                        dispatch(startBusinessProcess(responseBusinessProcess.id, variables))
                            .then((instance) => {
                                const changeTasks = tasks.map(item => item.uri).filter(uri => {
                                    const [, type] = uri.split(':')
                                    return type === 'task'
                                })
                                dispatch(createBusinessProcessLink(instance.id, variables?.name?.value ?? 'Процесс', changeTasks))
                                dispatch(getBusinessProcessTasks())
                                    .then(taskList => {
                                        dispatch(getTaskHistoryBusinessProcessInstance(instance.id))
                                            .then(historyTaskList => {
                                                let task = historyTaskList[0];
                                                task = taskList.find(bpTask => bpTask.id === task.id);
                                                if (task) {
                                                    const usersToNotify = [];
                                                    let executors = task.props.find(prop => prop.name === 'executor')
                                                    const observer = task.props.find(prop => prop.name === 'observer')
                                                    const workFlowName = task.props.find(prop => prop.name === 'name');
                                                    executors = JSON.parse(executors.value);

                                                    const uri = `camunda:wf_task:${task.id}`;
                                                    if (observer?.value) {
                                                        const observerMessage = `У вас появилась задача "${task.name}" в workflow "${workFlowName.value}" для наблюдения`;
                                                        usersToNotify.push({
                                                            userToNotifyId: observer.value,
                                                            notifyMessage: observerMessage,
                                                            uri
                                                        });

                                                    }
                                                    const executorMessage = `У вас появилась задача "${task.name}" в workflow "${workFlowName.value}" для согласования`;
                                                    executors.forEach(executor => usersToNotify.push({
                                                        userToNotifyId: executor.name,
                                                        notifyMessage: executorMessage,
                                                        uri
                                                    }));
                                                    dispatch(notifyUsersAboutBusinessProcessTask(usersToNotify));
                                                }
                                            })
                                    })
                                setIsOpenDialogParams(false)
                                setArParams([])
                                setTasks([])
                            })
                    }
                })
        }

    }

    return (
        <>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title="Доступные к запуску WF"
                    columns={columns}
                    data={businessProcess}
                    options={options}
                />
            </MuiThemeProvider>

            <Dialog open={isOpenDialogDiagram} onClose={() => setIsOpenDialogDiagram(null)} maxWidth={false} fullWidth>
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={() => setIsOpenDialogDiagram(null)}>
                    <CloseIcon />
                </IconButton>
                <Card className={classes.dialogScroll}>
                    <CardContent>
                        <div ref={SVGelem} />
                    </CardContent>
                </Card>
            </Dialog>
            {isOpenDialogParams
            && (
                <DialogParameters
                    isOpenDialog={isOpenDialogParams}
                    setIsOpenDialog={setIsOpenDialogParams}
                    arParams={arParams}
                    setArParams={setArParams}
                    businessProcess={currentTemplate}
                    action={startProcess}
                    customViewAfter={(
                        <DialogChooserAttachments
                            data={tasks}
                            onAddItem={(item) => setTasks([...tasks, item])}
                            onRemoveItem={(uri) => {
                                const removeIndex = tasks.map(item => item.uri).indexOf(uri);
                                const newTasks = [...tasks]
                                newTasks.splice(removeIndex, 1)
                                setTasks(newTasks)
                            }}
                        />
                    )}
                    labelHeader="Цель WorkFlow"
                    labelBtn="Начать процесс"
                />
            )}
            <div className={classes.hidden}>
                <div ref={bpmnviewInstance} />
            </div>
        </>
    )
}

export default BusinessProcessTemplateList
