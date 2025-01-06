/**
 * Primitive
 * @desc Type representing [`Primitive`](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) types in TypeScript: `string | number | bigint | boolean |  symbol | null | undefined`
 * @example
 *   type Various = number | string | object;
 *
 *    // Expect: object
 *   type Cleaned = Exclude<Various, Primitive>
 */
export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

/**
 * Falsy
 * @desc Type representing falsy values in TypeScript: `false | "" | 0 | null | undefined`
 * @example
 *   type Various = 'a' | 'b' | undefined | false;
 *
 *   // Expect: "a" | "b"
 *   Exclude<Various, Falsy>;
 */
export type Falsy = false | "" | 0 | null | undefined;

/**
 * Nullish
 * @desc Type representing [nullish values][https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing] in TypeScript: `null | undefined`
 * @example
 *   type Various = 'a' | 'b' | undefined;
 *
 *   // Expect: "a" | "b"
 *   Exclude<Various, Nullish>;
 */
export type Nullish = null | undefined;

/**
 * Tests for one of the [`Primitive`](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) types using the JavaScript [`typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) operator
 *
 * Clarification: TypeScript overloads this operator to produce TypeScript types if used in context of types.
 *
 * @param val The value to be tested
 * @returns If `val` is primitive. If used in the flow of the program typescript will infer type-information from this.
 *
 * @example
 *   const consumer = (value: Primitive | Primitive[]) => {
 *       if (isPrimitive(value)) {
 *           return console.log('Primitive value: ', value);
 *       }
 *       // type of value now inferred as Primitive[]
 *       value.map((primitive) => consumer(primitive));
 *   };
 */
export const isPrimitive = (val: unknown): val is Primitive => {
  if (val === null || val === undefined) {
    return true;
  }
  switch (typeof val) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "symbol": {
      return true;
    }
    default:
      return false;
  }
};

/**
 * Tests for Falsy by simply applying negation `!` to the tested `val`.
 *
 * The value is mostly in added type-information and explicity,
 * but in case of this simple type much the same can often be archived by just using negation `!`:
 * @example
 *   const consumer = (value: boolean | Falsy) => {
 *     if (!value) {
 *         return ;
 *     }
 *     type newType = typeof value; // === true
 *     // do stuff
 *   };
 */
export const isFalsy = (val: unknown): val is Falsy => !val;

/**
 * Tests for Nullish by simply comparing `val` for equality with `null`.
 * @example
 *   const consumer = (param: Nullish | string): string => {
 *     if (isNullish(param)) {
 *       // typeof param === Nullish
 *       return String(param) + ' was Nullish';
 *     }
 *     // typeof param === string
 *     return param.toString();
 *   };
 */
export const isNullish = (val: unknown): val is Nullish => val == null;

/**
 * Credits to all the people who given inspiration and shared some very useful code snippets
 * in the following github issue: https://github.com/Microsoft/TypeScript/issues/12215
 */

/**
 * SetIntersection (same as Extract)
 * @desc Set intersection of given union types `A` and `B`
 * @example
 *   // Expect: "2" | "3"
 *   SetIntersection<'1' | '2' | '3', '2' | '3' | '4'>;
 *
 *   // Expect: () => void
 *   SetIntersection<string | number | (() => void), Function>;
 */
export type SetIntersection<A, B> = A extends B ? A : never;

/**
 * SetDifference (same as Exclude)
 * @desc Set difference of given union types `A` and `B`
 * @example
 *   // Expect: "1"
 *   SetDifference<'1' | '2' | '3', '2' | '3' | '4'>;
 *
 *   // Expect: string | number
 *   SetDifference<string | number | (() => void), Function>;
 */
export type SetDifference<A, B> = A extends B ? never : A;

/**
 * SetComplement
 * @desc Set complement of given union types `A` and (it's subset) `A1`
 * @example
 *   // Expect: "1"
 *   SetComplement<'1' | '2' | '3', '2' | '3'>;
 */
export type SetComplement<A, A1 extends A> = SetDifference<A, A1>;

/**
 * SymmetricDifference
 * @desc Set difference of union and intersection of given union types `A` and `B`
 * @example
 *   // Expect: "1" | "4"
 *   SymmetricDifference<'1' | '2' | '3', '2' | '3' | '4'>;
 */
export type SymmetricDifference<A, B> = SetDifference<A | B, A & B>;

/**
 * NonUndefined
 * @desc Exclude undefined from set `A`
 * @example
 *   // Expect: "string | null"
 *   SymmetricDifference<string | null | undefined>;
 */
export type NonUndefined<A> = A extends undefined ? never : A;

/**
 * NonNullable
 * @desc Exclude undefined and null from set `A`
 * @example
 *   // Expect: "string"
 *   SymmetricDifference<string | null | undefined>;
 */
// type NonNullable - built-in

/**
 * FunctionKeys
 * @desc Get union type of keys that are functions in object type `T`
 * @example
 *  type MixedProps = {name: string; setName: (name: string) => void; someKeys?: string; someFn?: (...args: any) => any;};
 *
 *   // Expect: "setName | someFn"
 *   type Keys = FunctionKeys<MixedProps>;
 */
export type FunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? K : never;
}[keyof T];

/**
 * NonFunctionKeys
 * @desc Get union type of keys that are non-functions in object type `T`
 * @example
 *   type MixedProps = {name: string; setName: (name: string) => void; someKeys?: string; someFn?: (...args: any) => any;};
 *
 *   // Expect: "name | someKey"
 *   type Keys = NonFunctionKeys<MixedProps>;
 */
export type NonFunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends Function ? never : K;
}[keyof T];

/**
 * MutableKeys
 * @desc Get union type of keys that are mutable in object type `T`
 * Credit: Matt McCutchen
 * https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript
 * @example
 *   type Props = { readonly foo: string; bar: number };
 *
 *   // Expect: "bar"
 *   type Keys = MutableKeys<Props>;
 */
export type MutableKeys<T extends object> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];
export type WritableKeys<T extends object> = MutableKeys<T>;

/**
 * ReadonlyKeys
 * @desc Get union type of keys that are readonly in object type `T`
 * Credit: Matt McCutchen
 * https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript
 * @example
 *   type Props = { readonly foo: string; bar: number };
 *
 *   // Expect: "foo"
 *   type Keys = ReadonlyKeys<Props>;
 */
export type ReadonlyKeys<T extends object> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >;
}[keyof T];

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? A
  : B;

/**
 * RequiredKeys
 * @desc Get union type of keys that are required in object type `T`
 * @see https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; optUndef?: number | undefined; };
 *
 *   // Expect: "req" | "reqUndef"
 *   type Keys = RequiredKeys<Props>;
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * OptionalKeys
 * @desc Get union type of keys that are optional in object type `T`
 * @see https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; optUndef?: number | undefined; };
 *
 *   // Expect: "opt" | "optUndef"
 *   type Keys = OptionalKeys<Props>;
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * UnionKeys
 * @desc Get keys of all objects in the union type `U`
 * Credit: filipomar
 * @see https://github.com/piotrwitek/utility-types/issues/192
 * @example
 *   // Expect: 'name' | 'age' | 'visible'
 *   UnionKeys<{ name: string; age: string } | { age: number } | { visible: boolean }>
 */
export type UnionKeys<U> = keyof UnionToIntersection<Partial<U>>;

/**
 * Pick (complements Omit)
 * @desc From `T` pick a set of properties by key `K`
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *
 *   // Expect: { age: number; }
 *   type Props = Pick<Props, 'age'>;
 */
namespace Pick {}

/**
 * PickByValue
 * @desc From `T` pick a set of properties by value matching `ValueType`.
 * Credit: [Piotr Lewandowski](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c)
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; };
 *
 *   // Expect: { req: number }
 *   type Props = PickByValue<Props, number>;
 *   // Expect: { req: number; reqUndef: number | undefined; }
 *   type Props = PickByValue<Props, number | undefined>;
 */
export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>;

/**
 * PickByValueExact
 * @desc From `T` pick a set of properties by value matching exact `ValueType`.
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; };
 *
 *   // Expect: { req: number }
 *   type Props = PickByValueExact<Props, number>;
 *   // Expect: { reqUndef: number | undefined; }
 *   type Props = PickByValueExact<Props, number | undefined>;
 */
export type PickByValueExact<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: [ValueType] extends [T[Key]]
      ? [T[Key]] extends [ValueType]
        ? Key
        : never
      : never;
  }[keyof T]
>;

/**
 * Omit (complements Pick)
 * @desc From `T` remove a set of properties by key `K`
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *
 *   // Expect: { name: string; visible: boolean; }
 *   type Props = Omit<Props, 'age'>;
 */
export type Omit<T, K extends keyof any> = Pick<T, SetDifference<keyof T, K>>;

/**
 * OmitByValue
 * @desc From `T` remove a set of properties by value matching `ValueType`.
 * Credit: [Piotr Lewandowski](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c)
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; };
 *
 *   // Expect: { reqUndef: number | undefined; opt?: string; }
 *   type Props = OmitByValue<Props, number>;
 *   // Expect: { opt?: string; }
 *   type Props = OmitByValue<Props, number | undefined>;
 */
export type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? never : Key }[keyof T]
>;

/**
 * OmitByValueExact
 * @desc From `T` remove a set of properties by value matching exact `ValueType`.
 * @example
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; };
 *
 *   // Expect: { reqUndef: number | undefined; opt?: string; }
 *   type Props = OmitByValueExact<Props, number>;
 *   // Expect: { req: number; opt?: string }
 *   type Props = OmitByValueExact<Props, number | undefined>;
 */
export type OmitByValueExact<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: [ValueType] extends [T[Key]]
      ? [T[Key]] extends [ValueType]
        ? never
        : Key
      : Key;
  }[keyof T]
>;

/**
 * Intersection
 * @desc From `T` pick properties that exist in `U`
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *   type DefaultProps = { age: number };
 *
 *   // Expect: { age: number; }
 *   type DuplicateProps = Intersection<Props, DefaultProps>;
 */
export type Intersection<T extends object, U extends object> = Pick<
  T,
  Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>;

/**
 * Diff
 * @desc From `T` remove properties that exist in `U`
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *   type DefaultProps = { age: number };
 *
 *   // Expect: { name: string; visible: boolean; }
 *   type DiffProps = Diff<Props, DefaultProps>;
 */
export type Diff<T extends object, U extends object> = Pick<
  T,
  SetDifference<keyof T, keyof U>
>;

/**
 * Subtract
 * @desc From `T` remove properties that exist in `T1` (`T1` has a subset of the properties of `T`)
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *   type DefaultProps = { age: number };
 *
 *   // Expect: { name: string; visible: boolean; }
 *   type RestProps = Subtract<Props, DefaultProps>;
 */
export type Subtract<T extends T1, T1 extends object> = Pick<
  T,
  SetComplement<keyof T, keyof T1>
>;

/**
 * Overwrite
 * @desc From `U` overwrite properties to `T`
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *   type NewProps = { age: string; other: string };
 *
 *   // Expect: { name: string; age: string; visible: boolean; }
 *   type ReplacedProps = Overwrite<Props, NewProps>;
 */
export type Overwrite<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T>,
> = Pick<I, keyof I>;

/**
 * Assign
 * @desc From `U` assign properties to `T` (just like object assign)
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *   type NewProps = { age: string; other: string };
 *
 *   // Expect: { name: string; age: number; visible: boolean; other: string; }
 *   type ExtendedProps = Assign<Props, NewProps>;
 */
export type Assign<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T> & Diff<U, T>,
> = Pick<I, keyof I>;

/**
 * Exact
 * @desc Create branded object type for exact type matching
 */
export type Exact<A extends object> = A & { __brand: keyof A };

/**
 * Unionize
 * @desc Disjoin object to form union of objects, each with single property
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *
 *   // Expect: { name: string; } | { age: number; } | { visible: boolean; }
 *   type UnionizedType = Unionize<Props>;
 */
export type Unionize<T extends object> = {
  [P in keyof T]: { [Q in P]: T[P] };
}[keyof T];

/**
 * PromiseType
 * @desc Obtain Promise resolve type
 * @example
 *   // Expect: string;
 *   type Response = PromiseType<Promise<string>>;
 */
export type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never;

// TODO: inline _DeepReadonlyArray with infer in DeepReadonly, same for all other deep types
/**
 * DeepReadonly
 * @desc Readonly that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   readonly first: {
 *   //     readonly second: {
 *   //       readonly name: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first: {
 *       second: {
 *         name: string;
 *       };
 *     };
 *   };
 *   type ReadonlyNestedProps = DeepReadonly<NestedProps>;
 */
export type DeepReadonly<T> = T extends ((...args: any[]) => any) | Primitive
  ? T
  : T extends _DeepReadonlyArray<infer U>
    ? _DeepReadonlyArray<U>
    : T extends _DeepReadonlyObject<infer V>
      ? _DeepReadonlyObject<V>
      : T;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
/** @private */
export type _DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * DeepRequired
 * @desc Required that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first: {
 *   //     second: {
 *   //       name: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first?: {
 *       second?: {
 *         name?: string;
 *       };
 *     };
 *   };
 *   type RequiredNestedProps = DeepRequired<NestedProps>;
 */
export type DeepRequired<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
    ? _DeepRequiredArray<T[number]>
    : T extends object
      ? _DeepRequiredObject<T>
      : T;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepRequiredArray<T>
  extends Array<DeepRequired<NonUndefined<T>>> {}
/** @private */
export type _DeepRequiredObject<T> = {
  [P in keyof T]-?: DeepRequired<NonUndefined<T[P]>>;
};

/**
 * DeepNonNullable
 * @desc NonNullable that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first: {
 *   //     second: {
 *   //       name: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first?: null | {
 *       second?: null | {
 *         name?: string | null |
 *         undefined;
 *       };
 *     };
 *   };
 *   type RequiredNestedProps = DeepNonNullable<NestedProps>;
 */
export type DeepNonNullable<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
    ? _DeepNonNullableArray<T[number]>
    : T extends object
      ? _DeepNonNullableObject<T>
      : T;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepNonNullableArray<T>
  extends Array<DeepNonNullable<NonNullable<T>>> {}
/** @private */
export type _DeepNonNullableObject<T> = {
  [P in keyof T]-?: DeepNonNullable<NonNullable<T[P]>>;
};

/**
 * DeepPartial
 * @desc Partial that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first?: {
 *   //     second?: {
 *   //       name?: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first: {
 *       second: {
 *         name: string;
 *       };
 *     };
 *   };
 *   type PartialNestedProps = DeepPartial<NestedProps>;
 */
export type DeepPartial<T> = { [P in keyof T]?: _DeepPartial<T[P]> };

/** @private */
export type _DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? _DeepPartialArray<U>
    : T extends object
      ? DeepPartial<T>
      : T | undefined;
/** @private */
export interface _DeepPartialArray<T> extends Array<_DeepPartial<T>> {}

/**
 * Brand
 * @desc Define nominal type of U based on type of T. Similar to Opaque types in Flow.
 * @example
 *   type USD = Brand<number, "USD">
 *   type EUR = Brand<number, "EUR">
 *
 *   const tax = 5 as USD;
 *   const usd = 10 as USD;
 *   const eur = 10 as EUR;
 *
 *   function gross(net: USD): USD {
 *     return (net + tax) as USD;
 *   }
 *
 *   // Expect: No compile error
 *   gross(usd);
 *   // Expect: Compile error (Type '"EUR"' is not assignable to type '"USD"'.)
 *   gross(eur);
 */
export type Brand<T, U> = T & { __brand: U };

/**
 * Optional
 * @desc From `T` make a set of properties by key `K` become optional
 * @example
 *    type Props = {
 *      name: string;
 *      age: number;
 *      visible: boolean;
 *    };
 *
 *    // Expect: { name?: string; age?: number; visible?: boolean; }
 *    type Props = Optional<Props>;
 *
 *    // Expect: { name: string; age?: number; visible?: boolean; }
 *    type Props = Optional<Props, 'age' | 'visible'>;
 */
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<
  T,
  K
> &
  Partial<Pick<T, K>>;

/**
 * ValuesType
 * @desc Get the union type of all the values in an object, array or array-like type `T`
 * @example
 *    type Props = { name: string; age: number; visible: boolean };
 *    // Expect: string | number | boolean
 *    type PropsValues = ValuesType<Props>;
 *
 *    type NumberArray = number[];
 *    // Expect: number
 *    type NumberItems = ValuesType<NumberArray>;
 *
 *    type ReadonlySymbolArray = readonly symbol[];
 *    // Expect: symbol
 *    type SymbolItems = ValuesType<ReadonlySymbolArray>;
 *
 *    type NumberTuple = [1, 2];
 *    // Expect: 1 | 2
 *    type NumberUnion = ValuesType<NumberTuple>;
 *
 *    type ReadonlyNumberTuple = readonly [1, 2];
 *    // Expect: 1 | 2
 *    type AnotherNumberUnion = ValuesType<NumberTuple>;
 *
 *    type BinaryArray = Uint8Array;
 *    // Expect: number
 *    type BinaryItems = ValuesType<BinaryArray>;
 */
export type ValuesType<
  T extends ReadonlyArray<any> | ArrayLike<any> | Record<any, any>,
> = T extends ReadonlyArray<any>
  ? T[number]
  : T extends ArrayLike<any>
    ? T[number]
    : T extends object
      ? T[keyof T]
      : never;

/**
 * Required
 * @desc From `T` make a set of properties by key `K` become required
 * @example
 *    type Props = {
 *      name?: string;
 *      age?: number;
 *      visible?: boolean;
 *    };
 *
 *    // Expect: { name: string; age: number; visible: boolean; }
 *    type Props = Required<Props>;
 *
 *    // Expect: { name?: string; age: number; visible: boolean; }
 *    type Props = Required<Props, 'age' | 'visible'>;
 */
export type AugmentedRequired<
  T extends object,
  K extends keyof T = keyof T,
> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * UnionToIntersection
 * @desc Get intersection type given union type `U`
 * Credit: jcalz
 * @see https://stackoverflow.com/a/50375286/7381355
 * @example
 *   // Expect: { name: string } & { age: number } & { visible: boolean }
 *   UnionToIntersection<{ name: string } | { age: number } | { visible: boolean }>
 */
export type UnionToIntersection<U> = (
  U extends any
    ? (k: U) => void
    : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Mutable
 * @desc From `T` make all properties become mutable
 * @example
 *    type Props = {
 *      readonly name: string;
 *      readonly age: number;
 *      readonly visible: boolean;
 *    };
 *
 *    // Expect: { name: string; age: number; visible: boolean; }
 *    Mutable<Props>;
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
export type Writable<T> = Mutable<T>;
/**
 * Keys
 * @desc Get the union type of all the keys in an object type `T`
 * @see https://flow.org/en/docs/types/utilities/#toc-keys
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *
 *   // Expect: "name" | "age" | "visible"
 *   type PropsKeys = Keys<Props>;
 */
export type Keys<T extends object> = keyof T;

/**
 * Values
 * @desc Get the union type of all the values in an object type `T`
 * @see https://flow.org/en/docs/types/utilities/#toc-values
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *
 *   // Expect: string | number | boolean
 *   type PropsValues = Values<Props>;
 */
export type Values<T extends object> = T[keyof T];

/**
 * ReadOnly
 * @desc Get the read-only version of a given object type `T` (it works on nested data structure)
 * @see https://flow.org/en/docs/types/utilities/#toc-readonly
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *
 *   // Expect: Readonly<{ name: string; age: number; visible: boolean; }>
 *   type ReadOnlyProps = ReadOnly<Props>;
 */
export type ReadOnly<T extends object> = DeepReadonly<T>;

/**
 * Diff
 * @desc Get the set difference of a given object types `T` and `U` (`T \ U`)
 * @see https://flow.org/en/docs/types/utilities/#toc-diff
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *   type DefaultProps = { age: number };
 *
 *   // Expect: { name: string; visible: boolean; }
 *   type RequiredProps = Diff<Props, DefaultProps>;
 */
export type Except<T extends U, U extends object> = Pick<
  T,
  SetComplement<keyof T, keyof U>
>;

/**
 * PropertyType
 * @desc Get the type of property of an object at a given key `K`
 * @see https://flow.org/en/docs/types/utilities/#toc-propertytype
 * @example
 *   // Expect: string;
 *   type Props = { name: string; age: number; visible: boolean };
 *   type NameType = PropertyType<Props, 'name'>;
 *
 *   // Expect: boolean
 *   type Tuple = [boolean, number];
 *   type A = PropertyType<Tuple, '0'>;
 *   // Expect: number
 *   type B = PropertyType<Tuple, '1'>;
 */
export type PropertyType<T extends object, K extends keyof T> = T[K];

/**
 * ElementType
 * @desc Get the type of elements inside of array, tuple or object of type `T`, that matches the given index type `K`
 * @see https://flow.org/en/docs/types/utilities/#toc-elementtype
 * @example
 *   // Expect: string;
 *   type Props = { name: string; age: number; visible: boolean };
 *   type NameType = ElementType<Props, 'name'>;
 *
 *   // Expect: boolean
 *   type Tuple = [boolean, number];
 *   type A = ElementType<Tuple, '0'>;
 *   // Expect: number
 *   type B = ElementType<Tuple, '1'>;
 *
 *   // Expect: boolean
 *   type Arr = boolean[];
 *   type ItemsType = ElementType<Arr, number>;
 *
 *   // Expect: number
 *   type Obj = { [key: string]: number };
 *   type ValuesType = ElementType<Obj, string>;
 */
export type ElementType<
  T extends { [P in K & any]: any },
  K extends keyof T | number,
> = T[K];

/**
 * Call
 * @desc Get the return type from a given typeof expression
 * @see https://flow.org/en/docs/types/utilities/#toc-call
 * @example
 *   // Common use-case
 *   const add = (amount: number) => ({ type: 'ADD' as 'ADD', payload: amount });
 *   type AddAction = Call<typeof add>; // { type: 'ADD'; payload: number }
 *
 *   // Examples migrated from Flow docs
 *   type ExtractPropType<T extends { prop: any }> = (arg: T) => T['prop'];
 *   type Obj = { prop: number };
 *   type PropType = Call<ExtractPropType<Obj>>; // number
 *
 *   type ExtractReturnType<T extends () => any> = (arg: T) => ReturnType<T>;
 *   type Fn = () => number;
 *   type FnReturnType = Call<ExtractReturnType<Fn>>; // number
 */
export type Call<Fn extends (...args: any[]) => any> = Fn extends (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  arg: any,
) => infer RT
  ? RT
  : never;

/**
 * Shape
 * @desc Copies the shape of the type supplied, but marks every field optional.
 * @see https://flow.org/en/docs/types/utilities/#toc-shape
 * @example
 *   type Props = { name: string; age: number; visible: boolean };
 *
 *   // Expect: Partial<Props>
 *   type PartialProps = Shape<Props>;
 */
export type Shape<T extends object> = Partial<T>;

/**
 * NonMaybeType
 * @desc Excludes null and undefined from T
 * @see https://flow.org/en/docs/types/utilities/#toc-nonmaybe
 * @example
 *   type MaybeName = string | null;
 *
 *   // Expect: string
 *   type Name = NonMaybeType<MaybeName>;
 */
export type NonMaybeType<T> = NonNullable<T>;

/**
 * Class
 * @desc Represents constructor of type T
 * @see https://flow.org/en/docs/types/utilities/#toc-class
 * @example
 *   class Store {}
 *   function makeStore(storeClass: Class<Store>): Store {
 *     return new storeClass();
 *   }
 */
export type Class<T> = new (...args: any[]) => T;

/**
 * mixed
 * @desc An arbitrary type that could be anything
 * @see https://flow.org/en/docs/types/mixed
 * @example
 *
 * function stringify(value: mixed) {
 *     // ...
 *   }
 *
 *   stringify("foo");
 *   stringify(3.14);
 *   stringify(null);
 *   stringify({});
 */
export type mixed = unknown;
