/**
 * Copyright (c) 2019 Emilio Almansi. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see the file LICENSE in the root directory.
 */

import { clearIntervalAsync } from './clear'
import { validateHandler, validateInterval } from './validation'
import SetIntervalAsyncError from './error'
import SetIntervalAsyncTimer from './timer'

/**
 * Executes the given handler at fixed intervals, while preventing<br>
 * multiple concurrent executions. The handler will never be executed<br>
 * concurrently more than once in any given moment, providing a fixed<br>
 * time interval between the <strong>end</strong> of a given execution and the <strong>start</strong> of<br>
 * the following one.
 *
 * @param {function} handler - Handler function to be executed in intervals.<br>
 *                             May be asynchronous.
 * @param {number} interval - Interval in milliseconds. Must be at least 10 ms.
 * @param {...*} args - Any number of arguments to pass on to the handler.
 * @returns {SetIntervalAsyncTimer}
 *          A timer object which can be used to stop execution with {@link clearIntervalAsync}.
 *
 * @alias [Fixed] setIntervalAsync
 */
function setIntervalAsync (handler, interval, ...args) {
  validateHandler(handler)
  validateInterval(interval)
  const timer = new SetIntervalAsyncTimer()
  const id = timer.id
  timer.timeouts[id] = setTimeout(
    timeoutHandler,
    interval,
    timer,
    handler,
    interval,
    ...args
  )
  return timer
}

function timeoutHandler (timer, handler, interval, ...args) {
  const id = timer.id
  timer.promises[id] = (async () => {
    try {
      await handler(...args)
    } catch (err) {
      console.error(err)
    }
    if (!timer.stopped) {
      timer.timeouts[id + 1] = setTimeout(
        timeoutHandler,
        interval,
        timer,
        handler,
        interval,
        ...args
      )
    }
    delete timer.timeouts[id]
    delete timer.promises[id]
  })()
  timer.id = id + 1
}

export { setIntervalAsync, clearIntervalAsync, SetIntervalAsyncError }
