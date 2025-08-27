import cogoToast from "@successtar/cogo-toast";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GenericTable from "../../../components/generic-table/GenericTable";
import Layout from "../../../components/layout";
import DeleteModal from "../../../components/modals/DeleteModal";
import EditTemplateModal from "../../../components/modals/EditTemplateModal";
import TemplatesModal from "../../../components/modals/TemplateModal";
import { templatesConfig } from "../../../constants";
import {
  deleteStructureTemplate,
  duplicateStructureTemplate,
  fetchTemplatesByWorkspace,
  useTemplateAsStructure,
} from "../../../redux/slices/structure-templates";

const Templates = () => {
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const workspaceId = Cookies.get("workspaceId");
  const { templates, status } = useSelector(
    (state) => state.structureTemplates
  );
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchTemplatesByWorkspace(workspaceId));
  }, [dispatch]);

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleDelete = (template) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteStructureTemplate(selectedTemplate.id))
      .unwrap()
      .then(() => {
        cogoToast.success("Template deleted!");
        setIsDeleteModalOpen(false);
      })
      .catch((err) => {
        cogoToast.error(err.message || "Delete failed");
      });
  };

  const handleAction = (action, template) => {
    switch (action.tooltip) {
      case "Edit Template":
        return handleEdit(template);

      case "Delete Template":
        return handleDelete(template);

      case "Duplicate Template":
        dispatch(duplicateStructureTemplate({ templateId: template.id }))
          .unwrap()
          .then(() => {
            cogoToast.success("Template duplicated successfully!");
            dispatch(fetchTemplatesByWorkspace(workspaceId));
          })
          .catch((err) => {
            cogoToast.error(err.message || "Failed to duplicate template.");
          });
        return;

      case "Utilize Template":
        dispatch(
          useTemplateAsStructure({
            templateId: template.id,
            overrides: {
              name: `${template.name} (From Template)`,
              ownerId: Cookies.get("atlas_userId"),
              workspaceId,
            },
          })
        )
          .unwrap()
          .then(() => {
            cogoToast.success("Structure created from template!");
          })
          .catch((err) => {
            cogoToast.error(err.message || "Failed to utilize template.");
          });
        return;

      default:
        return;
    }
  };

  const filteredTemplates = templates.filter((tpl) =>
    `${tpl.name} ${tpl.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  {
    status === "loading" && (
      <div className="flex h-screen flex-col text-center p-6">
        <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {status === "loading" && (
        <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-main border-t-transparent"></div>
        </div>
      )}

      <div className="p-2">
        <GenericTable
          {...templatesConfig}
          data={filteredTemplates}
          searchQuery={searchQuery}
          enableSearch={true}
          enableDate={false}
          onSearchChange={setSearchQuery}
          actions={templatesConfig.actions.map((action) => ({
            ...action,
            onClick: (template) => handleAction(action, template),
          }))}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          title={selectedTemplate?.name || "this template"}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
        {isEditModalOpen && (
          <EditTemplateModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            template={selectedTemplate}
            onSuccess={() => dispatch(fetchTemplatesByWorkspace(workspaceId))}
          />
        )}

        {isTemplatesModalOpen && (
          <TemplatesModal
            onClose={() => setIsTemplatesModalOpen(false)}
            onCreate={() => {
              setIsTemplatesModalOpen(false);
              dispatch(fetchTemplatesByWorkspace(workspaceId));
            }}
            defaultTemplate={selectedTemplate}
          />
        )}
      </div>
    </Layout>
  );
};

export default Templates;
