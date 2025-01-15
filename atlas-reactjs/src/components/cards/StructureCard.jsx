import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../components/cards/Card";
import Icons from "../../constants/icons";
import { getStructuresByUserId } from "../../redux/slices/structures";
import { formatRelativeTime } from "../../utils/timeUtils";

const StructureCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const ownerId = Cookies.get("atlas_userId");
  const username = Cookies.get("atlas_username");

  const fetchStructures = () => {
    if (ownerId) {
      dispatch(getStructuresByUserId(ownerId)).then((data) => {
        setStructures(Array.isArray(data?.payload) ? data?.payload : []);
      });
    }
  };

  useEffect(() => {
    fetchStructures();
  }, [dispatch, ownerId]);

  const handleClick = (structureId) => {
    navigate(`/app/s/${username}/${structureId}`);
  };

  return (
    <>
      {structures.length === 0 ? (
        <div className="flex flex-col h-auto text-center p-6">
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex items-center justify-center bg-white rounded-full w-28 h-28 mb-4">
              <Icons.IIcon className="text-5xl text-custom-main" />
            </div>
            <p className="text-2xl font-bold text-custom-text-grey mb-4">
              No structures found. <br /> Start creating your first structure!
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-[18px] bg-custom-background-white h-auto shadow-md">
          <div className="flex flex-col items-start gap-2">
            <h2 className="text-[24px] font-bold text-black mb-3">Dashboard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {structures.map((structure) => (
              <Card
                key={structure.id}
                title={structure.title || "Untitled"}
                imageUrl={structure.imageUrl || "/assets/markmap-image.png"}
                footerTitle={`Modified ${formatRelativeTime(
                  structure.createdAt
                )}`}
                username={username}
                structureId={structure.id}
                footerSubtitle={username || "Unknown User"}
                avatarUrl={structure.avatarUrl || "/assets/userimg.jpeg"}
                onActionClick={() => handleClick(structure.id)}
                onSuccess={fetchStructures}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default StructureCard;
