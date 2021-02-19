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

export const toggleIsBusinessProcessFetching = isBusinessProcessFetching => ({
    type: TOGGLE_IS_BUSINESSPROCESS_FETCHING,
    isBusinessProcessFetching
});

export const toggleIsBusinessProcessCreating = isBusinessProcessCreating => ({
    type: TOGGLE_IS_BUSINESSPROCESS_CREATING,
    isBusinessProcessCreating
});

export const toggleIsBusinessProcessDeleting = isBusinessProcessDeleting => ({
    type: TOGGLE_IS_BUSINESSPROCESS_DELETING,
    isBusinessProcessDeleting
});

export const startBusinessProcess = isStartedBusinessProcess => ({
    type: START_BUSINESSPROCESS,
    isStartedBusinessProcess
});

export const setBusinessProcess = businessProcess => ({
    type: SET_BUSINESSPROCESS,
    businessProcess
});

export const setBusinessProcessUsers = businessProcessUsers => ({
    type: SET_BUSINESSPROCESS_USERS,
    businessProcessUsers
});

export const setCurrentBusinessProcess = currentBusinessProcess => ({
    type: SET_CURRENT_BUSINESSPROCESS,
    currentBusinessProcess
});

export const setIsCopyBusinessProcess = isCopyBusinessProcess => ({
    type: IS_COPY_BUSINESSPROCESS,
    isCopyBusinessProcess
});

export const setNewTemplateName = newTemplateName => ({
    type: SET_NEW_TEMPLATE_NAME,
    newTemplateName
});

export const setNewTemplateCode = newTemplateCode => ({
    type: SET_NEW_TEMPLATE_CODE,
    newTemplateCode
});

export const setParentBpCode = parentBpCode => ({
    type: SET_PARENT_BP_CODE,
    parentBpCode
});

export const setParentBpId = parentBpId => ({
    type: SET_PARENT_BP_ID,
    parentBpId
});
