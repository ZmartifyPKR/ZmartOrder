import { Component, forwardRef, Input, OnChanges } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

const noop = () => {};

export function counterRangeValidator(maxValue, minValue) {
  return (c: FormControl) => {
    let err = {
      rangeError: {
        given: c.value,
        max: maxValue || 10,
        min: minValue || 0
      }
    };

  return (c.value > +maxValue || c.value < +minValue) ? err: null;
  }
}

@Component({
  selector: 'counter-input',
  templateUrl: 'counter-input.html',
  host: {
    'class': 'counter-input'
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CounterInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CounterInput), multi: true }
  ]
})
export class CounterInput implements ControlValueAccessor, OnChanges {

  propagateChange:any = noop;
  validateFn:any = noop;

  @Input('counterValue') _counterValue = 0;
  @Input('max') counterRangeMax = 9999;
  @Input('min') counterRangeMin = 0;
  @Input('step') counterStep = 1;

  constructor() {
    console.log('loaded');
    
  }
  get counterValue() {
    return this._counterValue;
  }

  set counterValue(val) {
    this._counterValue = val;
    this.propagateChange(val);
  }

  ngOnChanges(inputs) {
    if (inputs.counterRangeMax || inputs.counterRangeMin) {
      this.validateFn = counterRangeValidator(this.counterRangeMax, this.counterRangeMin);
    }
  }

  writeValue(value) {
    if (value) {
      this.counterValue = value;
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  increase(delta) {
    console.log('increase', this.counterValue, this.counterStep);
    if (this.counterRangeMax > this.counterValue) this.counterValue = Number(this.counterValue) + Number(delta);
  }

  decrease(delta) {
    console.log('decrease', this.counterValue, this.counterStep);
    if (this.counterRangeMin < this.counterValue) this.counterValue = Number(this.counterValue) - Number(delta);
  }

  validate(c: FormControl) {
    return this.validateFn(c);
  }
}
