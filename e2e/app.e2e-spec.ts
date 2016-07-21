import { Ng2MapsPage } from './app.po';

describe('ng2-maps App', function() {
  let page: Ng2MapsPage;

  beforeEach(() => {
    page = new Ng2MapsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
