export { getErrorMessageIfThrows };

function getErrorMessageIfThrows(cb: () => unknown) {
  try {
    cb();
    return undefined;
  } catch (err) {
    if (typeof err === 'string') {
      return err;
    }

    if (err instanceof Error) {
      return err.message;
    }

    if (typeof err === 'object' && err !== null && Object.prototype.hasOwnProperty.call(err, 'message')) {
      return (err as { message: string }).message;
    }

    return '发生未知错误';
  }
}
