import {bpAPI} from "../../api/bpAPI";
import {showErrorNotify, showSuccessNotifyLocal} from "../action/notifications";
import {
    setBusinessProcess,
    setBusinessProcessUsers,
    setCurrentBusinessProcess,
    toggleIsBusinessProcessCreating,
    toggleIsBusinessProcessDeleting,
    toggleIsBusinessProcessFetching
} from "../action/bp";
import {toggleIsAvailableChangeTaskStatusesFetching} from "../action/changeTasks";

export const getBusinessProcessList = () => dispatch => {
    dispatch(toggleIsBusinessProcessFetching(true));
    return bpAPI.getBusinessProcessList()
        .then(data => {
            data = data.filter(item => item.resource !== "usersUpdate.bpmn")
            dispatch(toggleIsBusinessProcessFetching(false));
            dispatch(setBusinessProcess(data))
        }).catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 402:
                        dispatch(showErrorNotify('Возвращается, если некоторые параметры запроса недопустимы, например, если указан параметр sortOrder, но не sortBy. (ошибка 402)'))
                        break
                    case 500:
                        dispatch(showErrorNotify('Ошибка при получении списка Бизнес-процессов. (ошибка 500)'))
                        break
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message} (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
};

export const getBusinessProcessUsersList = () => dispatch => {
    dispatch(toggleIsBusinessProcessFetching(true));
    return bpAPI.getBusinessProcessUsersList()
        .then(data => {
            dispatch(toggleIsBusinessProcessFetching(false));
            dispatch(setBusinessProcessUsers(data))
            return data
        }).catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 500:
                        dispatch(showErrorNotify('Ошибка при получении списка Бизнес-процессов. (ошибка 500)'))
                        break
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message} (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
};

export const getBusinessProcessById = (businessProcessId) => dispatch => {
    dispatch(toggleIsBusinessProcessFetching(true));
    return bpAPI.getBusinessProcessById(businessProcessId)
        .then(data => {
            dispatch(toggleIsBusinessProcessFetching(false));
            dispatch(setCurrentBusinessProcess(data));
            return data;
        }).catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        dispatch(showErrorNotify('Определение процесса с данным идентификатором или ключом не существует. (ошибка 404)'))
                        break
                    case 500:
                        dispatch(showErrorNotify('Ошибка при получении бизнес-процесса. (ошибка 500)'))
                        break
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
}

export const createBusinessProcess = (businessProcessForm) => dispatch => {
    dispatch(toggleIsBusinessProcessCreating(true))
    return bpAPI.createBusinessProcess(businessProcessForm)
        .then(data => {
            dispatch(toggleIsBusinessProcessCreating(false))
            if (data?.deployedProcessDefinitions === null) {
                dispatch(deleteBusinessProcess(data.id))
                dispatch(showErrorNotify('Ошибка при создании бизнес-процесса. Некорректный бизнес-процесс'))
                return data
            }
            return data
        }).catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        dispatch(showErrorNotify('Один из ресурсов bpmn не может быть проанализирован. (ошибка 400)'))
                        break
                    case 500:
                        dispatch(showErrorNotify('Ошибка при создании бизнес-процесса. (ошибка 500)'))
                        break
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
}

export const deleteBusinessProcess = (businessProcessId) => dispatch => {
    dispatch(toggleIsBusinessProcessDeleting(true))
    return bpAPI.deleteBusinessProcess(businessProcessId)
        .then(data => {
            dispatch(toggleIsBusinessProcessDeleting(false))
            dispatch(getBusinessProcessList())
            dispatch(showSuccessNotifyLocal(`Бизнес-процесс "${businessProcessId}" успешно удален`))
            return data
        }).catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        dispatch(showErrorNotify('Бизнес-процесса с указанным идентификатором не существует. (ошибка 404)'))
                        break
                    case 500:
                        dispatch(showErrorNotify('Ошибка при удалении бизнес-процесса. (ошибка 500)'))
                        break
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
}

export const startBusinessProcess = (businessProcessId, variables) => dispatch => {
    variables = _preparationData(variables)
    return bpAPI.startBusinessProcess(businessProcessId, variables)
        .then(data => {
            dispatch(showSuccessNotifyLocal(`Бизнес-процесс успешно запущен`))
            return data
        }).catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        dispatch(showErrorNotify('Экземпляр процесса не может быть создан из-за недопустимого значения переменной,'
                                + ' например, если значение не может быть проанализировано до целочисленного значения или переданный тип '
                                + 'переменной не поддерживается. (ошибка 400)'))
                        break
                    case 404:
                        dispatch(showErrorNotify('Экземпляр не может быть создан из-за отсутствия ключа определения процесса. (ошибка 404)'))
                        break
                    case 500:
                        dispatch(showErrorNotify('Ошибка при удалении бизнес-процесса. Экземпляр процесса не может быть успешно создан. (ошибка 500)'))
                        break
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
}

export const archiveWorkflow = workflowId => dispatch => bpAPI.archiveWorkflow(workflowId)
    .then(response => {
        if (response.status === 200) {
            dispatch(showSuccessNotifyLocal('Архивация шаблона workflow произведена.'))
        }
    })
    .catch(error => {
        if (error.response) {
            switch (error.response.status) {
                case 404:
                    dispatch(showErrorNotify('Бизнес-процесс не найден. (ошибка 404)'))
                    break
                case 406:
                    dispatch(showErrorNotify('Повторная архивация невозможна, бизнес-процесс уже заархивирован. (ошибка 406)'))
                    break
                case 502:
                    dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                    break
                default:
                    dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
            }
        } else {
            dispatch(showErrorNotify(error.message))
        }
    })

export const getBusinessProcessParams = () => dispatch => bpAPI.getBusinessProcessParams()
    .then(data => {
        data = _convertData(data)
        return data
    }).catch(error => {
        if (error.response) {
            switch (error.response.status) {
                case 502:
                    dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                    break
                default:
                    dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
            }
        } else {
            dispatch(showErrorNotify(error.message))
        }
    })

export const getBusinessProcessTemplates = () => dispatch => bpAPI.getBusinessProcessTemplates()
    .then(data => {
        data = _convertTemplates(data)
        dispatch(setBusinessProcess(data))
        return data
    }).catch(error => {
        if (error.response) {
            switch (error.response.status) {
                case 502:
                    dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                    break;
                default:
                    dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
            }
        } else {
            dispatch(showErrorNotify(error.message))
        }
    })

export const deleteBusinessProcessTemplate = (bpId) => dispatch => {
    dispatch(toggleIsBusinessProcessDeleting(true))
    return bpAPI.deleteBusinessProcessTemplate(bpId)
        .then(data => {
            dispatch(toggleIsBusinessProcessDeleting(false))
            dispatch(getBusinessProcessTemplates())
            dispatch(showSuccessNotifyLocal(`Бизнес-процесс "${bpId}" успешно удален`))
            return data
        }).catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break;
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
}

export const createBusinessProcessXML = (businessProcess) => dispatch => {
    dispatch(toggleIsBusinessProcessCreating(true))
    return bpAPI.createBusinessProcessXML(businessProcess)
        .then((data) => {
            dispatch(toggleIsBusinessProcessCreating(false))
            dispatch(showSuccessNotifyLocal('Бизнес-процесс успешно сохранен'))
            return data
        })
        .catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 412:
                        dispatch(showErrorNotify('Отсутсвуют данные бизнес-процесса. (ошибка 412)'))
                        break;
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break;
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
}

export const updateBusinessProcessXML = (businessProcess) => dispatch => {
    dispatch(toggleIsBusinessProcessCreating(true))
    return bpAPI.updateBusinessProcessXML(businessProcess)
        .then((data) => {
            dispatch(toggleIsBusinessProcessCreating(false))
            dispatch(showSuccessNotifyLocal('Бизнес-процесс успешно сохранен'))
            return data
        })
        .catch(error => {
            if (error.response) {
                switch (error.response.status) {
                    case 412:
                        dispatch(showErrorNotify('Отсутсвуют данные бизнес-процесса. (ошибка 412)'))
                        break;
                    case 502:
                        dispatch(showErrorNotify('Сервер недоступен. (ошибка 502)'))
                        break;
                    default:
                        dispatch(showErrorNotify(`${error.response.data.message}. (ошибка ${error.response.status})`))
                }
            } else {
                dispatch(showErrorNotify(error.message))
            }
        })
}

export const getBusinessProcessXML = async (BusinessProcessId) => await bpAPI.getBusinessProcessXML(BusinessProcessId)


const _preparationData = data => {
    for (const key in data) {
        let type = "String"
        switch (data[key].type) {
            // number
            case 1:
                type = "Double"
                break
            // select, date
            case 2:
            case 3:
                type = "String"
                break
            //  radio, checkbox
            case 5:
            case 6:
                type = "Boolean"
                break
            // file
            case 4:
                type = "String"
                break
            // string
            default:
                type = "String"
                break
        }
        data[key].type = type
    }
    return data
}

export const createBusinessProcessLink = (bpId, bpName, list) => dispatch => {
    dispatch(toggleIsAvailableChangeTaskStatusesFetching(true));
    return bpAPI.createBusinessProcessLinkToTask(bpId, bpName, list)
        .then(_ => {
            dispatch(toggleIsAvailableChangeTaskStatusesFetching(false));
        }).catch(e => console.error(e))
}

const _convertTemplates = (templates) => {
    templates.forEach((temp, key) => {
        const utcDate = new Date(temp.createDate[0], temp.createDate[1] - 1, temp.createDate[2], temp.createDate[3], temp.createDate[4], temp.createDate[5]);
        const clientTimeShiftHours = new Date().getTimezoneOffset() / 60;
        utcDate.setHours(utcDate.getHours() - clientTimeShiftHours);
        templates[key] = {
            ...temp,
            createDate: utcDate.toLocaleString("ru-RU")
        }
    })
    return templates
}

const _convertData = (data) => {
    data = data.map((item) => {
        switch (item.type) {
            // select, radio
            case 3:
            case 5:
                item.value = ""
                item.opts = item.defaultValue ? item.defaultValue.split(',') : ""
                break
            // file
            case 4:
                item.value = ""
                break
            // checkbox
            case 6:
                item.value = String(item.defaultValue) === "true"
                break
            // string, number
            default:
                item.value = item.defaultValue ? item.defaultValue : ""
                break
        }
        return item
    })
    return data
}
