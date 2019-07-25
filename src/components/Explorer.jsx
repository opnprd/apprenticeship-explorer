import Apprentices from './Apprentices.jsx';

const apprenticeData = './report.json'

export default function Explorer (props) {
  return <Apprentices url={ apprenticeData } />;
}