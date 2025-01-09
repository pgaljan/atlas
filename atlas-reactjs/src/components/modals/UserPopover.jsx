import React, { useEffect, useRef, useState } from "react";

const UserPopover = () => {
  const [isOpen, setIsOpen] = useState(true);
  const popoverRef = useRef(null);

  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed right-40 top-24 opacity-100 transform translate-y-0 z-[50003] w-auto bg-white shadow-lg rounded-lg"
    >
      <div className="overflow-auto">
        {/* Participants List */}
        <div className="bg-gray-50 p-4 rounded-t-lg">
          <ul role="menu">
            <li role="none">
              <h2 className="text-sm font-semibold text-gray-600">Online</h2>
              <ul role="none" className="mt-2 space-y-2">
                <li
                  role="menuitem"
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="relative">
                    <img
                      src="/assets/userimg.jpeg"
                      alt="Participant avatar"
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    <div
                      className="absolute bottom-0 right-0 bg-orange-600 w-4 h-4 rounded-full flex items-center justify-center"
                      title="Facilitator"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-3 h-3 text-white"
                      >
                        <path d="m14.937 7.26-1.119-4.401c-.46-1.812-3.18-1.812-3.64-.002L9.06 7.26c-.068.266-.234.5-.468.66-.233.162-.52.239-.808.218l-4.762-.351c-1.96-.145-2.8 2.305-1.124 3.279l4.07 2.368c.247.143.43.365.52.626.09.26.078.542-.032.796L4.63 19.038c-.751 1.721 1.449 3.235 2.945 2.027l3.634-2.938c.22-.177.5-.274.788-.274.29 0 .569.097.79.274l3.633 2.938c1.496 1.208 3.696-.306 2.945-2.027l-1.825-4.184a1.098 1.098 0 0 1-.032-.795c.09-.26.273-.483.52-.626l4.074-2.367c1.675-.972.835-3.424-1.125-3.28l-4.763.352a1.267 1.267 0 0 1-.81-.216 1.15 1.15 0 0 1-.468-.662Z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      John Doe
                      <span className="ml-2 text-xs text-gray-400">Online</span>
                    </div>
                    <div className="text-xs text-gray-500">Atlas owner</div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Settings Section */}
        <div className="p-4 bg-gray-100 rounded-b-lg">
          <ul role="menu">
            <li role="menuitem">
              <a
                href="#"
                target="_self"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-2 text-gray-800 hover:bg-gray-200 rounded-lg"
              >
                <div className="w-5 h-5 text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                  >
                    <path d="M9.781 5.22a1.656 1.656 0 0 1 1.648-1.492h1.142c.85 0 1.563.645 1.648 1.491l.005.05a.896.896 0 0 0 .532.714c.079.036.157.074.235.113a.895.895 0 0 0 .89-.029l.043-.027a1.656 1.656 0 0 1 2.192.358l.713.894c.53.665.47 1.623-.139 2.217l-.035.035a.896.896 0 0 0-.227.861c.021.084.04.17.058.255a.895.895 0 0 0 .578.678l.047.016a1.656 1.656 0 0 1 1.087 1.938l-.254 1.114c-.19.83-.976 1.38-1.82 1.274l-.05-.006a.895.895 0 0 0-.815.36 6.291 6.291 0 0 1-.163.203.895.895 0 0 0-.17.875l.018.048c.291.8-.07 1.689-.837 2.058l-1.03.496a1.656 1.656 0 0 1-2.13-.629l-.028-.044a.894.894 0 0 0-.788-.412 7.145 7.145 0 0 1-.262 0 .895.895 0 0 0-.788.412l-.027.044a1.656 1.656 0 0 1-2.131.629l-1.03-.496a1.656 1.656 0 0 1-.837-2.058l.017-.049a.895.895 0 0 0-.17-.873 6.63 6.63 0 0 1-.162-.205.895.895 0 0 0-.814-.359l-.051.007a1.656 1.656 0 0 1-1.82-1.275l-.254-1.114c-.19-.83.28-1.667 1.087-1.938l.047-.016a.895.895 0 0 0 .578-.678c.018-.086.037-.17.058-.255a.896.896 0 0 0-.227-.86L5.31 9.51a1.656 1.656 0 0 1-.139-2.218l.712-.894a1.656 1.656 0 0 1 2.193-.358l.042.027a.895.895 0 0 0 .89.03 8.52 8.52 0 0 1 .236-.115.896.896 0 0 0 .532-.714l.005-.049ZM12 15.318a3.312 3.312 0 1 0 0-6.624 3.312 3.312 0 0 0 0 6.623Z" />
                  </svg>
                </div>
                <span className="text-sm">Manage Team Members</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserPopover;
