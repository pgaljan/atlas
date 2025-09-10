import { IoTrash } from 'react-icons/io5';

const TagsManager = ({ tags, mode, onAddTag, onEditTag, onDeleteTag }) => {
  return (
    <div className="space-y-3">
      {tags.map((tag) => (
        <div key={tag.id} className="flex items-center">
          {mode === 'view' ? (
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-gray-100  rounded text-sm text-gray-700">
                {tag.key}
              </span>
              <span className="px-2 py-1 bg-gray-200  rounded text-sm text-gray-700">
                {tag.value}
              </span>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={tag.key}
                onChange={(e) => onEditTag(tag.id, 'key', e.target.value)}
                placeholder="Enter Key"

                readOnly={mode === 'view'}
                className={`w-40 border-2 rounded-md p-2 focus:outline-none ${
                  mode === 'view' ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-custom-main'
                }`}
              />
              <input
                type="text"
                value={tag.value}
                onChange={(e) => onEditTag(tag.id, 'value', e.target.value)}
                placeholder="Enter Value"

                readOnly={mode === 'view'}
                className={`w-40 ml-10 border-2 rounded-md p-2 focus:outline-none ${
                  mode === 'view' ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-custom-main'
                }`}
              />
              <button
                onClick={() => onDeleteTag(tag.id)}
                className="ml-auto flex items-center justify-center w-9 h-9 rounded-full bg-custom-main text-white hover:bg-custom-main-dark"
              >
                <IoTrash className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      ))}

      {/* {(mode === "add" || mode === "edit") && (
        <button
          onClick={onAddTag}
          className="mt-2 px-4 py-2 bg-custom-main text-white rounded-lg hover:bg-custom-main-dark"
        >
          + Add
        </button>
      )} */}
    </div>
  );
};

export default TagsManager;
