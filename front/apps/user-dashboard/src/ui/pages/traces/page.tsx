import Introduction from './introduction';
import TracesList from './traces-list';
import UserWelcome from './user-welcome';

const TracesPageComponent = () => (
  <div className="content-wrapper-lg px16" id="page-container">
    <UserWelcome />
    <Introduction />
    <TracesList />
  </div>
);

TracesPageComponent.displayName = 'TracesPageComponent';

export default TracesPageComponent;
