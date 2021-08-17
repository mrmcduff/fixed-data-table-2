/**
 * Copyright Schrodinger, LLC
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableContainer
 * @typechecks
 * @noflow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import invariant from './stubs/invariant';
import pick from 'lodash/pick';

import * as ActionTypes from './actions/ActionTypes';
import * as columnActions from './actions/columnActions';
import * as scrollActions from './actions/scrollActions';
import FixedDataTable from './FixedDataTable';
import FixedDataTableStore from './FixedDataTableStore';
import Scrollbar from './plugins/Scrollbar';
import ScrollContainer from './plugins/ScrollContainer';

class FixedDataTableContainer extends React.Component {
  static defaultProps = {
    defaultScrollbars: true,
    scrollbarXHeight: Scrollbar.SIZE,
    scrollbarYWidth: Scrollbar.SIZE,
  };

  constructor(props) {
    super(props);

    this.reduxStore = FixedDataTableStore.get();

    this.scrollActions = bindActionCreators(
      scrollActions,
      this.reduxStore.dispatch
    );
    this.columnActions = bindActionCreators(
      columnActions,
      this.reduxStore.dispatch
    );

    this.reduxStore.dispatch({
      type: ActionTypes.INITIALIZE,
      props,
    });

    this.unsubscribe = this.reduxStore.subscribe(this.onStoreUpdate.bind(this));
    this.state = {
      boundState: FixedDataTableContainer.getBoundState(this.reduxStore), // bound state represents the state from the store that's passed on to FDT
      reduxStore: this.reduxStore, // put store instance to local state so that getDerivedStateFromProps can access it
    };
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    invariant(
      nextProps.height !== undefined || nextProps.maxHeight !== undefined,
      'You must set either a height or a maxHeight'
    );

    // Unlike componentWillReceiveProps is only called when props are changed.
    // But getDerivedStateFromProps is called for both prop and state updates.
    // If props are unchanged, then there's no need to calculate derived state.
    if (nextProps === currentState.boundState.propsReference) {
      return null;
    }

    // Props have changed, so update the redux store with the latest props and also return the new state
    currentState.reduxStore.dispatch({
      type: ActionTypes.PROP_CHANGE,
      newProps: nextProps,
      oldProps: currentState.boundState.propsReference,
    });

    return {
      boundState: FixedDataTableContainer.getBoundState(
        currentState.reduxStore
      ),
    };
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.reduxStore = null;
  }

  render() {
    const fdt = (
      <FixedDataTable
        {...this.props}
        {...this.state.boundState}
        scrollActions={this.scrollActions}
        columnActions={this.columnActions}
      />
    );
    // For backward compatibility, by default we render FDT-2 scrollbars
    if (this.props.defaultScrollbars) {
      return <ScrollContainer {...this.props}>{fdt}</ScrollContainer>;
    }
    return fdt;
  }

  static getBoundState(reduxStore) {
    const state = reduxStore.getState();
    const boundState = pick(state, [
      'columnGroupProps',
      'columnProps',
      'columnReorderingData',
      'columnResizingData',
      'elementHeights',
      'elementTemplates',
      'firstRowIndex',
      'endRowIndex',
      'isColumnReordering',
      'isColumnResizing',
      'maxScrollX',
      'maxScrollY',
      'propsReference',
      'rows',
      'rowOffsets',
      'rowSettings',
      'scrollContentHeight',
      'scrollFlags',
      'scrollX',
      'scrollY',
      'scrolling',
      'scrollJumpedX',
      'scrollJumpedY',
      'tableSize',
    ]);
    return boundState;
  }

  onStoreUpdate() {
    const newBoundState = FixedDataTableContainer.getBoundState(
      this.reduxStore
    );

    // if onStoreUpdate was called through a prop change, then skip it.
    // This is because getDerivedStateFromProps already calculates the new bound state.
    if (this.state.boundState.propsReference !== newBoundState.propsReference) {
      return;
    }

    this.setState({ boundState: newBoundState });
  }
}

export default FixedDataTableContainer;
