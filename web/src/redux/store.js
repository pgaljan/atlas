import { configureStore } from "@reduxjs/toolkit";
import elementsReducer from "./slices/elements";
import plansReducer from "./slices/plans";
import recordsReducer from "./slices/records";
import restoreBackupsReducer from "./slices/restore-backups";
import rolesReducer from "./slices/roles";
import uploadFilesReducer from "./slices/upload-files";
import userReducer from "./slices/users";
import structureTemplatesSlice from "./slices/structure-templates";
import structureSharingReducer from "./slices/structure-sharing";
import appSettingsReducer from "./slices/app-settings";
import privacyPolicyReducer from "./slices/privacy-policy"; 
import cleansheetReducer from "./slices/cleansheet"

const store = configureStore({
  reducer: {
    user: userReducer,
    elements: elementsReducer,
    plans: plansReducer,
    records: recordsReducer,
    restoreBackups: restoreBackupsReducer,
    roles: rolesReducer,
    uploadFiles: uploadFilesReducer,
    structureTemplates: structureTemplatesSlice,
    structureShares: structureSharingReducer,
    appSettings: appSettingsReducer,
     privacyPolicy: privacyPolicyReducer,
      cleansheet: cleansheetReducer,
  },
});

export default store;
