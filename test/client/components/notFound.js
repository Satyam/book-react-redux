import NotFound from 'components/notFound';
import { expect, shallowRender } from 'test/utils/renderers';

describe('Component: NotFound', () => {
  it('Simple render', () => {
    const result = shallowRender(NotFound, { location: { pathname: 'here' } });
    expect(result.find('h1')).to.contain.text('Not found');
    expect(result.find('code')).to.contain.text('here');
  });
});
