export default initialDispatch => Connector => {
  class Connected extends Connector {
    componentWillMount() {
      if (super.componentWillMount) super.componentWillMount();
      const store = this.context.store;
      initialDispatch(store.dispatch, store.getState(), this.props);
    }
    componentWillReceiveProps(nextProps) {
      if (super.componentWillReceiveProps) super.componentWillReceiveProps(nextProps);
      const store = this.context.store;
      initialDispatch(store.dispatch, store.getState(), nextProps, this.props);
    }
  }

  Connected.initialDispatch = initialDispatch;
  return Connected;
};
