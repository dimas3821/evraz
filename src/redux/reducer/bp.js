import {
    TOGGLE_IS_BUSINESSPROCESS_CREATING,
    TOGGLE_IS_BUSINESSPROCESS_DELETING,
    TOGGLE_IS_BUSINESSPROCESS_FETCHING,
    SET_BUSINESSPROCESS,
    SET_CURRENT_BUSINESSPROCESS,
    START_BUSINESSPROCESS,
    SET_BUSINESSPROCESS_USERS,
    IS_COPY_BUSINESSPROCESS,
    SET_NEW_TEMPLATE_NAME,
    SET_PARENT_BP_CODE,
    SET_PARENT_BP_ID,
    SET_NEW_TEMPLATE_CODE
} from '../constant/bp'

const initialState = {
    businessProcess: [],
    businessProcessUsers: [],
    isBusinessProcessFetching: false,
    isCopyBusinessProcess: false,
    currentBusinessProcess: null,
    newTemplateName: '',
    newTemplateCode: '',
    parentBpCode: '',
    parentBpId: ''
}

const businessProcessReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_IS_BUSINESSPROCESS_CREATING:
            return {
                ...state,
                isCreating: action.isCreating
            };
        case TOGGLE_IS_BUSINESSPROCESS_DELETING:
            return {
                ...state,
                isDeleting: action.isDeleting
            };
        case TOGGLE_IS_BUSINESSPROCESS_FETCHING:
            return {
                ...state,
                isBusinessProcessFetching: action.isBusinessProcessFetching
            };
        case START_BUSINESSPROCESS:
            return {
                ...state
            };
        case SET_BUSINESSPROCESS:
            return {
                ...state,
                businessProcess: action.businessProcess
            };
        case SET_BUSINESSPROCESS_USERS:
            return {
                ...state,
                businessProcessUsers: action.businessProcessUsers
            };
        case SET_CURRENT_BUSINESSPROCESS:
            return {
                ...state,
                currentBusinessProcess: action.currentBusinessProcess
            };
        case IS_COPY_BUSINESSPROCESS:
            return {
                ...state,
                isCopyBusinessProcess: action.isCopyBusinessProcess
            };
        case SET_NEW_TEMPLATE_NAME:
            return {
                ...state,
                newTemplateName: action.newTemplateName
            };
        case SET_NEW_TEMPLATE_CODE:
            return {
                ...state,
                newTemplateCode: action.newTemplateCode
            };
        case SET_PARENT_BP_CODE:
            return {
                ...state,
                parentBpCode: action.parentBpCode
            }
        case SET_PARENT_BP_ID:
            return {
                ...state,
                parentBpId: action.parentBpId
            }
        default:
            return state;
    }
}

export default businessProcessReducer
