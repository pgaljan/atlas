import AdminLayout from "../../../components/admin/admin-layout";
import ChangePasswordCard from "../../../components/admin/user-profile/ChangePassword";
import UserAddressCard from "../../../components/admin/user-profile/UserAddressCard";
import UserInfoCard from "../../../components/admin/user-profile/UserInfoCard";
import UserMetaCard from "../../../components/admin/user-profile/UserMetaCard";

const UserProfiles = () => {
  return (
    <>
      <AdminLayout>
        <div className="p-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-10">
            <h3 className="mb-5 text-3xl font-semibold text-gray-800 ">
              Profile
            </h3>
            <div className="space-y-6">
              <UserMetaCard />
              <UserInfoCard />
              <UserAddressCard />
              <ChangePasswordCard />
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};
export default UserProfiles;
