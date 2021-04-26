/**
 * Copyright Schrodinger, LLC
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ResizeReorderCell
 * @typechecks
 * @file Wrapper component for ResizerKnob and ReorderHandle. It is responsible for translating cell in case of reordering
 */

import FixedDataTableCellDefault from '../../FixedDataTableCellDefault';
import React from 'react';
import PropTypes from 'prop-types';
import ResizerKnob from './ResizerKnob';
import ReorderHandle from './ReorderHandle';
import joinClasses from '../../vendor_upstream/core/joinClasses';
import cx from '../../vendor_upstream/stubs/cx';
import { PluginContext } from '../../Context';

const BORDER_WIDTH = 1;

/**
 * A plugin that can make use of ResizerKnob and ReorderHandle to provide the
 * resize and reorder functionality to the columns.
 *
 * Pass this to the `header` prop of the `Column` to invoke resizer/reorder handle.
 * `onColumnResizeEnd` and `onColumnReorderEnd` activate the respective
 * functionality. Either one or both can be used together.
 *
 */
class ResizeReorderCell extends React.PureComponent {

  /**
   * @param {JSX.Element} content
   * @param {CSSProperties} style
   * @param {string} className
   * @returns {function(CSSProperties, React.ReactNode, boolean)}
   */
  renderReorderHandleContent = (content, style, className) =>
    (reorderStyles, reorderHandle, isReordering) => {
      const reorderClasses = joinClasses(className, cx({
        'public/fixedDataTableCell/hasReorderHandle': true,
        'public/fixedDataTableCell/reordering': isReordering,
      }));
      return <div className={reorderClasses} style={{ ...style, ...reorderStyles }}>
        {reorderHandle}
        {content}
      </div>;
    };

  /**
   * @param {JSX.Element} content
   * @param {CSSProperties} style
   * @param {string} className
   * @returns {JSX.Element|null}
   */
  renderReorderHandle = (content, style, className) => {
    if (!this.props.onColumnReorderEnd) {
      return null;
    }

    return (
      <ReorderHandle
        render={this.renderReorderHandleContent(content, style, className)}
        onColumnReorderStart={this.props.onColumnReorderStart}
        touchEnabled={this.props.touchEnabled}
        height={this.props.height}
        isRTL={this.context.isRTL}
        columnKey={this.props.columnKey}
        left={this.props.left}
        onColumnReorderEndCallback={this.props.onColumnReorderEnd}
        {...this.props}
      />
    );
  };

  renderResizerKnob = () => {
    if (!this.props.onColumnResizeEnd) {
      return null;
    }

    return (
      <ResizerKnob
        height={this.props.height}
        resizerLineHeight={this.context.tableHeight}
        onColumnResizeEnd={this.props.onColumnResizeEnd}
        left={this.props.left}
        width={this.props.width}
        minWidth={this.props.minWidth}
        maxWidth={this.props.maxWidth}
        columnKey={this.props.columnKey}
        touchEnabled={this.props.touchEnabled}
        isRTL={this.context.isRTL}
      />
    );
  };

  render() {
    const {
      children,
      availableScrollWidth,
      minWidth,
      maxWidth,
      onColumnResizeEnd,
      onColumnReorderEnd,
      rowIndex,
      left,
      touchEnabled,
      isFixed,
      scrollToX,
      getCellGroupWidth,
      onColumnReorderStart,
      columnGroupWidth,
      ...props
    } = this.props;

    let style = {
      height: props.height,
      width: props.width - BORDER_WIDTH,
    };

    if (this.context.isRTL) {
      style.right = left;
    } else {
      style.left = left;
    }

    let className = joinClasses(
      cx({
        'resize-reorder-cell-container': true,
      }),
      props.className,
    );

    let content;
    if (React.isValidElement(children)) {
      content = React.cloneElement(children, props);
    } else if (typeof children === 'function') {
      content = children(props);
    } else {
      content = (
        <FixedDataTableCellDefault {...props}>
          {children}
        </FixedDataTableCellDefault>
      );
    }

    if (onColumnReorderEnd) {
      return (
        <>
          {this.renderReorderHandle(content, style, className)}
          {this.renderResizerKnob()}
        </>
      );
    }
    return (
      <div className={className} style={style}>
        {this.renderResizerKnob()}
        {content}
      </div>
    );
  }
}

ResizeReorderCell.propTypes = {
  /**
   * Outer height of the cell.
   */
  height: PropTypes.number,

  /**
   * Outer width of the cell.
   */
  width: PropTypes.number,

  /**
   * Optional prop that if specified on the `Column` will be passed to the
   * cell. It can be used to uniquely identify which column is the cell is in.
   */
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /**
   * Optional prop that represents the rows index in the table.
   * For the 'cell' prop of a Column, this parameter will exist for any
   * cell in a row with a positive index.
   *
   * Below that entry point the user is welcome to consume or
   * pass the prop through at their discretion.
   */
  rowIndex: PropTypes.number,

  /**
   * The left offset in pixels of the cell.
   * Space between cell's left edge and left edge of table
   */
  left: PropTypes.number,

  /**
   * Whether touch is enabled or not.
   */
  touchEnabled: PropTypes.bool,

  /**
   * availableScrollWidth returned from ColumnWidths.
   */
  availableScrollWidth: PropTypes.number,

  /**
   * Function to change the scroll position by interacting
   * with the store.
   */
  scrollToX: PropTypes.func,

  /**
   * Whether the cells belongs to the fixed group
   */
  isFixed: PropTypes.bool,

  /**
   * The minimum width of the column.
   */
  minWidth: PropTypes.number,

  /**
   * The maximum width of the column.
   */
  maxWidth: PropTypes.number,

  /**
   * Callback function which is called when reordering starts
   */
  onColumnReorderStart: PropTypes.func,

  /**
   * Function to return cell group widths
   */
  getCellGroupWidth: PropTypes.func,

  /**
   * Callback function which is called when resizing ends
   */
  onColumnResizeEnd: PropTypes.func,

  /**
   * Callback function which is called when reordering ends
   */
  onColumnReorderEnd: PropTypes.func,
};

ResizeReorderCell.contextType = PluginContext;

ResizeReorderCell.defaultProps = {
  onColumnReorderStart: _.noop,
};

export default ResizeReorderCell;
