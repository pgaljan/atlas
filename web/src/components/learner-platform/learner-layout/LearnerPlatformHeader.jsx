import { Navbar } from 'flowbite-react';
import CustomLearnerPlatformMenu from '../../menu/CustomLearnerPlatformMenu';

const LearnerHeader = () => {
  return (
    <header className="w-full bg-gray-100">
      <Navbar fluid rounded className="p-4">
        <Navbar.Brand href="#"></Navbar.Brand>
        <div className="flex items-center gap-x-4">
          <CustomLearnerPlatformMenu />
        </div>
      </Navbar>
    </header>
  );
};

export default LearnerHeader;
