// To help minification
const {
  create: objectCreate,
  assign: objectAssign,

  // eslint-disable-next-line @typescript-eslint/unbound-method
  prototype: { hasOwnProperty },
} = Object;
const dateNow = Date.now;

export { objectAssign, objectCreate, dateNow, hasOwnProperty };
