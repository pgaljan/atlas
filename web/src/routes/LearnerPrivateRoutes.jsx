import PropTypes from 'prop-types';

/**
 * Placeholder wrapper for Learner private routes.
 * Currently has no authentication or routing logic,
 * just renders its children.
 */
const LearnerPrivateRoutes = ({ children }) => {
  return <>{children}</>;
};

LearnerPrivateRoutes.propTypes = {
  children: PropTypes.node,
};

export default LearnerPrivateRoutes;
