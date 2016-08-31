export default initialDispatch => Connector => {
  class Connected extends Connector {
    componentWillMount() {
      if (super.componentWillMount) super.componentWillMount();
      initialDispatch(this.store.dispatch, this.props, null, this.state.storeState);
    }
    componentWillReceiveProps(nextProps) {
      if (super.componentWillReceiveProps) super.componentWillReceiveProps(nextProps);
      initialDispatch(this.store.dispatch, nextProps, this.props, this.state.storeState);
    }
  }

  Connected.initialDispatch = initialDispatch;
  return Connected;
};
