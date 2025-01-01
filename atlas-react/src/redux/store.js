import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import elementsReducer from "./slices/elements";
import plansReducer from "./slices/plans";
import recordsReducer from "./slices/records";
import restoreBackupsReducer from "./slices/restore-backups";
import rolesReducer from "./slices/roles";
import structuresReducer from "./slices/structures";
import uploadFilesReducer from "./slices/upload-files";
import userReducer from "./slices/users";

const store = configureStore({
  reducer: {
    // auth: authReducer,
    user: userReducer,
    elements: elementsReducer,
    plans: plansReducer,
    records: recordsReducer,
    restoreBackups: restoreBackupsReducer,
    roles: rolesReducer,
    structures: structuresReducer,
    uploadFiles: uploadFilesReducer,
  },
});

export default store;
