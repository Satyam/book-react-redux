import NotFound from '_components/notFound';
import { expect, shallowRender } from '_test/utils/renderers';

describe('Component: NotFound', () => {
  it('Simple render', () => {
    const result = shallowRender(NotFound, { location: { pathname: 'here' } });
    expect(result.find('h1')).to.contain.text('Not found');
    expect(result.find('code')).to.contain.text('here');
  });
});
