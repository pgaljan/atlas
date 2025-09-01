import cogoToast from '@successtar/cogo-toast';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GenericTable from '../../../components/generic-table/GenericTable';
import DeleteModal from '../../../components/modals/DeleteModal';
import EditTemplateModal from '../../../components/modals/EditTemplateModal';
import TemplatesModal from '../../../components/modals/TemplateModal';
import LoadingSpinner from '../../../components/loader/LoadingSpinner';
import { templatesConfig } from '../../../constants';
import {
  deleteStructureTemplate,
  duplicateStructureTemplate,
  fetchTemplatesByWorkspace,
  useTemplateAsStructure,
} from '../../../redux/slices/structure-templates';

const Templates = () => {
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const workspaceId = Cookies.get('workspaceId');
  const { templates, status } = useSelector((state) => state.structureTemplates);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        cogoToast.success('Template deleted!');
        setIsDeleteModalOpen(false);
      })
      .catch((err) => {
        cogoToast.error(err.message || 'Delete failed');
      });
  };

  const handleAction = (action, template) => {
    switch (action.tooltip) {
      case 'Edit Template':
        return handleEdit(template);

      case 'Delete Template':
        return handleDelete(template);

      case 'Duplicate Template':
        dispatch(duplicateStructureTemplate({ templateId: template.id }))
          .unwrap()
          .then(() => {
            cogoToast.success('Template duplicated successfully!');
            dispatch(fetchTemplatesByWorkspace(workspaceId));
          })
          .catch((err) => {
            cogoToast.error(err.message || 'Failed to duplicate template.');
          });
        return;

      case 'Utilize Template':
        dispatch(
          useTemplateAsStructure({
            templateId: template.id,
            overrides: {
              name: `${template.name} (From Template)`,
              ownerId: Cookies.get('atlas_userId'),
              workspaceId,
            },
          }),
        )
          .unwrap()
          .then(() => {
            cogoToast.success('Structure created from template!');
          })
          .catch((err) => {
            cogoToast.error(err.message || 'Failed to utilize template.');
          });
        return;

      default:
        return;
    }
  };

  const filteredTemplates = templates.filter((tpl) =>
    `${tpl.name} ${tpl.description}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="p-2 flex flex-col h-full min-h-0">
        {status === 'loading' ? (
          <LoadingSpinner mode="overlay" message="Loading templates..." />
        ) : (
          <>
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
              title={selectedTemplate?.name || 'this template'}
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
          </>
        )}
      </div>
    </>
  );
};

export default Templates;
