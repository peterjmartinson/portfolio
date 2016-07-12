/*jslint white:true*/
/*
issues:
order of operations
cap the result of calculations to 10 digits
  -> tried the trim() function, doesn't work for some reason
  -> you're updating the screen
  -> do you need to update any of the values?
*/
'use strict';

angular.module('myApp.calculator',
  ['ngRoute',
  'ngMaterial',
  'ngMessages'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/calculator', {
    templateUrl: 'calculator/calculator.html',
    controller: 'CalculatorCtrl',
    controllerAs: 'calc'
  });
}])

.controller('CalculatorCtrl', function() {
  var self = this,
      signs = /[+\-\*\/]/;

  var operate = function (l, o, r) {
    // need to deal with order of operations
    // for now, just go with first in, first out
    if ( o === '+' ) {
      return l+r;
    }
    else if ( o === '-' ) {
      return l-r;
    }
    else if ( o === '*' ) {
      return l*r;
    }
    else if ( o === '/' ) {
      return l/r;
    }
  };

  var trim = function (val) {
    if ( val.toString().indexOf('.') < 0 && val.toString().length > 10 ) {
      // no decimal, longer than 10 chars
      val = 'ERROR';
    }
    else if ( val.toString().indexOf('.') > -1 && val.toString().length > 10 ) {
      val = Math.round(val * Math.pow(10, Math.round(val).toString().length)) /
                   Math.pow(10, Math.round(val).toString().length);
    }
    return val;
  };

  self.inBuffer = {
    left:     'empty',
    operator: 'empty',
    right:    'empty',
    screen:   '0',
    updateBuffer: function(b) {
      console.log('expression: ' + this.left + ' ' + this.operator + ' ' + this.right);
      
      // clear the buffer
      if ( b === 'C' ) {
        this.left = 'empty';
        this.operator = 'empty';
        this.right = 'empty';

        console.log ('Cleared!!');
      }
// this.right.toString().length
// this.right.toFixed()
      // enter a number
      else if (typeof b === 'number') {
        this.left = this.left;
        this.operator = this.operator;
        if ( this.right === 'empty' ) {
          this.right = b;
          this.right = this.right.toString();
        }
        else if ( this.right.toString().length < 10 ) {
          this.right = this.right.toString() + b;
        }
      }
      // enter an operator
      else if ( b.match(signs) ) {
        if ( this.left === 'empty' ) {
          this.left = Number(this.right);
          this.operator = b;
          this.right = 'empty';
        }
        else if ( this.left !== 'empty' && this.right !== 'empty' ) {
          this.left = operate(this.left, this.operator, Number(this.right));
          this.operator = b;
          this.right = 'empty';
        }
        else if ( this.left !== 'empty' && this.right === 'empty' ) {
          this.left = this.left;
          this.operator = b;
          this.right = this.right.toString();
        }
      }

      // enter +/-
      else if ( b === 'pm' ) {
        if ( this.left !== 'empty' && this.operator !== 'empty'&& this.right !== 'empty' ) {
          this.left = this.left;
          this.operator = this.operator;
          this.right = Number(this.right * -1);
          this.right = this.right.toString();
        }
        else if ( this.left !== 'empty' && this.operator !== 'empty'&& this.right === 'empty' ) { 
          this.left = this.left;
          this.operator = this.operator;
          this.right = Number(this.left * -1);
          this.right = this.right.toString();
        }
        else if ( this.left === 'empty' && this.operator === 'empty'&& this.right !== 'empty' ) {
          this.left = 'empty';
          this.operator = 'empty';
          this.right = Number(this.right * -1);
          this.right = this.right.toString();
        }
      }

      // enter .
      // problem here is decimal gets wiped out when converted to Number()
      // need to leave this.right a string until it gets evaluated or moved
      // to this.left
      else if ( b === '.' ) {
        // check if a decimal exists yet
        if ( this.right.indexOf('.') === -1 && this.right.length < 10 ) {
          if ( Math.round(Number(this.right)) === Number(this.right) ) {
            console.log('inside the decimal: ' + b);
            this.left = this.left;
            this.operator = this.operator;
            this.right = this.right.toString() + '.';
          }
          else if ( this.right === 'empty') {
            console.log('inside the decimal: ' + b);
            this.left = this.left;
            this.operator = this.operator;
            this.right = '0.';
          }
        }
      }

      // enter =
      else if ( b === '=' &&
                this.left     !== 'empty' &&
                this.operator !== 'empty' &&
                this.right    !== 'empty' ) {
        this.right = operate(this.left, this.operator, Number(this.right));
        this.left = 'empty';
        this.operator = 'empty';
        if ( this.right.toString().indexOf('.') < 0 && this.right.toString().length > 10 ) {
          // no decimal, longer than 10 chars
          this.right = 'ERROR';
        }
        else if ( this.right.toString().indexOf('.') > -1 && this.right.toString().length > 10 ) {
          this.right = Math.round(this.right * Math.pow(10, Math.round(this.right).toString().length)) /
                       Math.pow(10, Math.round(this.right).toString().length);
          
        }
      }

      // enter square-root
      else if ( b === 'root' ) {
        if ( this.right > 0 ) {
          this.left = this.left;
          this.operator = this.operator;
          this.right = Math.sqrt(Number(this.right));
          this.right = this.right.toString();
        }
      }


      // update the screen
      if ( this.right === 'empty' ) {
        if ( this.operator === 'empty' ) {
          this.screen = '0';
        }
        else {
          this.screen = this.left;
        }
      }
      else {
        this.screen = this.right;
      }

      if ( this.screen.length > 10 ) {
        this.screen = trim(this.screen);
//        if ( Math.round(Number(this.screen)).toString() > 10 ) {
//          this.screen = 'ERROR';
//        }
//        else {
//          this.screen = this.string.substr(0,9);
//        }
      }

      return {
        left:     this.left,
        operator: this.operator,
        right:    this.right,
        screen:   this.screen
      }

    }
  };
});
// need to design some kind of buffer
// starts clear, but concatenates with button pushes
// pressing = parses the buffer and outputs the result
// pressing C re-initializes the buffer
// each button press appends to current buffer
// first idea - buffer should just be a simple string
//   "7+3/20-13"
// but... if it's a parsed string, I need to design order of operations
// so, better to use JS's math engine, somehow.
