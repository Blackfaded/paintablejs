import '@testing-library/jest-dom/extend-expect';

import 'jest-enzyme';
import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
const adapter = Adapter as any;
configure({ adapter: new adapter.default() });
