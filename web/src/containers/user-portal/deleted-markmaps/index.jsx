import { trashConfig } from '../../../constants/index';
import GenericTable from '../../../components/generic-table/GenericTable';

const DeletedMarkmaps = ({ onSubmit }) => {
  const data = [
    // {
    //   id: 1,
    //   name: "John Doe",
    //   deletedBy: "John Doe",
    //   deletedAt: "12-23-2024 12:00 pm",
    // },
  ];

  return (
    <div className="p-2">
      <GenericTable {...trashConfig} data={data} />
    </div>
  );
};

export default DeletedMarkmaps;
