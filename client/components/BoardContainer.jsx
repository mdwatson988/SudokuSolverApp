import React, { Component } from 'react';

import Board from './Board';
import SolveButton from './SolveButton';

class BoardContainer extends Component {
  constructor(props) {
    super(props);
    // state is set on Component mount by calling resetState
    this.state = {
      // row, col, 3x3 values saved into individual maps inside these objects
      rowValues: {},
      colValues: {},
      threeX3Values: {},
      invalidBoxes: new Set(),
      message: '',
    };
    this.handleBoxInput = this.handleBoxInput.bind(this);
    this.ensureValidity = this.ensureValidity.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
    // this.handleClickSolveButton = this.handleClickSolveButton.bind(this);
    
  }

  render() {
    return (
      <div id="boardContainer" className="container">
        <Board
          handleBoxInput={this.handleBoxInput}
          determine3x3={this.determine3x3}
        />

        {/* message only displayed with invalid input */}
        {this.state.message !== '' && <h3 id='message'>{this.state.message}</h3>}
        
        <SolveButton
          handleClickUpdateButton={this.props.handleClickUpdateButton}
          ensureValidity={this.ensureValidity}
          updateMessage={this.updateMessage}
          // handleClickSolveButton={this.handleClickSolveButton}
        />
      </div>
    );
  }

  determine3x3(row, col) {
    if (row <= 3) {
      if (col <= 3) return 1
      else if (col <= 6) return 2
      else return 3
    }
    else if (row <= 6) {
      if (col <= 3) return 4
      else if (col <= 6) return 5
      else return 6
    }
    else {
      if (col <= 3) return 7
      else if (col <= 6) return 8
      else return 9
    }
  };

  resetState() {
    const newRowValues = {};
    const newColValues = {};
    const new3x3Values = {};
    const newInvalidBoxes = new Set();
    for (let i = 1; i < 10; i++) {
      newRowValues[i] = new Map();
      newColValues[i] = new Map();
      new3x3Values[i] = new Map();
    }
    this.setState({
      rowValues: newRowValues,
      colValues: newColValues,
      threeX3Values: new3x3Values,
      invalidBoxes: newInvalidBoxes,
      message: '',
    })
  }

  componentDidMount() {
    this.resetState();
  }

  handleBoxInput(event) {
    const inputBox = event.target;
    const id = event.target.id;
    const rowKey = id[1];
    const colKey = id[3];
    const threeX3Key = this.determine3x3(rowKey, colKey);
    const newRowValues = this.state.rowValues;
    const newColValues = this.state.colValues;
    const new3x3Values = this.state.threeX3Values;
    const newInvalidBoxes = this.state.invalidBoxes;
    let newMessage = this.state.message;
    const inputValue = Number(event.target.value);

    function checkInputValidity() {
      const rowMap = newRowValues[rowKey];
      const colMap = newColValues[colKey];
      const threeX3Map = new3x3Values[threeX3Key];

      for (let [key, val] of rowMap.entries()) {
        if (inputValue == val) {
          const matchingBox = document.getElementById(key);
          matchingBox.setCustomValidity('Invalid');
          inputBox.setCustomValidity('Invalid');
          newInvalidBoxes.add(matchingBox).add(inputBox);
          newMessage += `Row #${rowKey} already contains a ${inputValue}. `;
        }
      }
      for (let [key, val] of colMap.entries()) {
        if (inputValue == val) {
          const matchingBox = document.getElementById(key);
          matchingBox.setCustomValidity('Invalid');
          inputBox.setCustomValidity('Invalid');
          newInvalidBoxes.add(matchingBox).add(inputBox);
          newMessage += `Column #${colKey} already contains a ${inputValue}. `;
        }
      }
      for (let [key, val] of threeX3Map.entries()) {
        if (inputValue == val) {
          const matchingBox = document.getElementById(key);
          matchingBox.setCustomValidity('Invalid');
          inputBox.setCustomValidity('Invalid');
          newInvalidBoxes.add(matchingBox).add(inputBox);
          newMessage += `3x3 #${threeX3Key} already contains a ${inputValue}. `;
        }
      }
    }
    checkInputValidity();

    // logic for removing values from state objects when numbers are deleted
    if (isNaN(event.target.valueAsNumber)) {
      newRowValues[rowKey].delete(id);
      newColValues[colKey].delete(id);
      new3x3Values[threeX3Key].delete(id);
    }

    // adds appropriate values to state with appropriate input if state obj doens't hold values for that box
    // input type disallows non-number inputs, first number to be inputted gets saved as long as isn't 0
    else if (!this.state.rowValues[rowKey].get(id) && inputValue != 0) {
      newRowValues[rowKey].set(id, inputValue);
      newColValues[colKey].set(id, inputValue);
      new3x3Values[threeX3Key].set(id, inputValue);
    }
    
    const determine3x3 = this.determine3x3;
    function resetValidity() {
      for (let invalidBox of newInvalidBoxes.values()) {
        const id = invalidBox.id
        const rowKey = id[1];
        const rowMap = newRowValues[rowKey];
        const value = rowMap.get(id);
        if (value) {
          const colKey = id[3];
          const threeX3Key = determine3x3(rowKey, colKey)
          const colMap = newColValues[colKey];
          const threeX3Map = new3x3Values[threeX3Key];
          let rowValueCounter = 0;
          let colValueCounter = 0;
          let threeX3ValueCounter = 0;
          for (const val of rowMap.values()) { if (val == value) rowValueCounter++ }
          for (const val of colMap.values()) { if (val == value) colValueCounter++ }
          for (const val of threeX3Map.values()) { if (val == value) threeX3ValueCounter++ }
          if (rowValueCounter <= 1 &&
            colValueCounter <= 1 &&
            threeX3ValueCounter <= 1) {
            invalidBox.setCustomValidity('');
            newInvalidBoxes.delete(invalidBox);
          }
        }
        else {
          invalidBox.setCustomValidity('');
          newInvalidBoxes.delete(invalidBox);
        }
      }
    }
    resetValidity()
    
    // reset/remove message if invalid inputs are removed
    if (this.ensureValidity()) newMessage = '';

    this.setState({
      rowValues: newRowValues,
      colValues: newColValues,
      threeX3Values: new3x3Values,
      invalidBoxes: newInvalidBoxes,
      message: newMessage,
    })
    
    // console.log(this.state.invalidBoxes);
  };

  updateMessage(string) {
    if (this.state.message === '') this.setState({ message: string })
    else {
      const newMessage = this.state.message + `\n${string}`
      this.setState({ message: newMessage })
    }
  }

  ensureValidity() {
    const boxList = document.querySelectorAll('.box');
    for (let i = 0; i < boxList.length; i++) {
      if (!boxList[i].checkValidity()) return false;
    }
    return true;
  }
};

export default BoardContainer;