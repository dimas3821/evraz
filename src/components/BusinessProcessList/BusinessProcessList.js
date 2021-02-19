import React, {useState} from 'react';
import {makeStyles} from "@material-ui/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import BusinessProcessInstancesList from "../Instances/BusinessProcessInstancesList/BusinessProcessInstancesList";
import BusinessProcessTaskList from "../Tasks/BusinessProcessTaskList/BusinessProcessTaskList";
import BusinessProcessTemplateList from "../Templates/BusinessProcessTemplateList/BusinessProcessTemplateList";
import {useSelector} from "react-redux";
import HistoryBusinessProcessList from "../Instances/HistoryBusinessProcessList/HistoryBusinessProcessList";
import HistoryBusinessProcessTaskList from "../Tasks/HistoryBusinessProcessTaskList/HistoryBusinessProcessTaskList";
import {useHistory} from "react-router-dom";

const useStyles = makeStyles(() => ({
    tabPanel: {
        marginTop: 8,
        paddingLeft: 4
    },
    tabItem: {
        fontSize: '14px !important',
        maxWidth: 380
    }
}))

const TabPanel = props => {
    const {
        children, value, index, ...other
    } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {children}
        </div>
    );
}

const TABS = [
    'templates',
    'processes',
    'tasks'
]

const BusinessProcessList = (props) => {

    const classes = useStyles()
    const history = useHistory()

    const currentLoggedInUser = useSelector(state => state.authData.currentLoggedInUser);
    const canUserViewProcesses = currentLoggedInUser.availableActions.includes("WF_VIEW");
    const canUserViewTasks = currentLoggedInUser.availableActions.includes("WF_VIEWTASK");

    const getTabIndex = () => TABS.indexOf(props.match.params.section) ?? 0
    const [activeTab, setActiveTab] = useState(getTabIndex())

    const getTabName = (tab) => TABS[tab]

    const handleChangeTab = (event, tab) => {
        setActiveTab(tab);
        history.push(`/admin/workflow/${getTabName(tab)}`)
    };

    return (
        <div className={classes.container}>
            <div className={classes.navigationPanel}>
                <Tabs
                    value={activeTab}
                    onChange={handleChangeTab}
                    className={classes.tabPanel}>
                    <Tab
                        label="Доступные к запуску"
                        className={classes.tabItem}
                        disabled={!canUserViewProcesses} />
                    <Tab
                        label="Запущенные мной"
                        className={classes.tabItem}
                        disabled={!canUserViewProcesses} />
                    <Tab
                        label="Назначенные мне и наблюдаемые задачи"
                        className={classes.tabItem}
                        disabled={!canUserViewTasks} />
                    <Tab
                        label="Завершенные процессы"
                        className={classes.tabItem}
                        disabled={!canUserViewProcesses} />
                    <Tab
                        label="Завершенные задачи"
                        className={classes.tabItem}
                        disabled={!canUserViewTasks} />
                </Tabs>
            </div>

            <TabPanel className="workflow-templates" value={activeTab} index={0}>
                <BusinessProcessTemplateList
                    handleChangeTab={handleChangeTab}
                    {...props}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <BusinessProcessInstancesList
                    handleChangeTab={handleChangeTab}
                    elementId={props.match.params.elementId}
                    subject={props.match.params.subject}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                <BusinessProcessTaskList
                    handleChangeTab={handleChangeTab}
                    elementId={props.match.params.elementId}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <HistoryBusinessProcessList
                    handleChangeTab={handleChangeTab}
                />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
                <HistoryBusinessProcessTaskList
                    handleChangeTab={handleChangeTab}
                />
            </TabPanel>

        </div>
    );
}

export default BusinessProcessList;
