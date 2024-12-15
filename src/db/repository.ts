import { AsyncLocalStorage } from "node:async_hooks";
import type {
  createInsertSchema,
  createSelectSchema,
} from "@/lib/drizzle-valibot";
import { startSpan } from "@sentry/remix";
import type { StartSpanOptions } from "@sentry/types";
import {
  type AnyColumn,
  type AnyTable,
  type BuildQueryResult,
  type DBQueryConfig,
  type DrizzleTypeError,
  type Equal,
  type ExtractTablesWithRelations,
  type GetColumnData,
  type InferSelectModel,
  type KnownKeysOnly,
  type Relation,
  type SQL,
  asc,
  createTableRelationsHelpers,
  desc,
  getOperators,
  getTableColumns,
  sql,
} from "drizzle-orm";
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import {
  type IndexColumn,
  type SQLiteInsertBase,
  type SQLiteInsertOnConflictDoUpdateConfig,
  type SQLiteInsertValue,
  type SQLiteTable,
  type SQLiteTableWithColumns,
  type SQLiteTransaction,
  type SQLiteUpdateSetSource,
  type SelectedFieldsFlat,
  type TableConfig,
  getTableConfig,
} from "drizzle-orm/sqlite-core";
import { camelCase } from "moderndash";
import postgres from "postgres";
import type * as v from "valibot";
import type { Database, Schema } from "./client";

/**
 * Retrieves the keys of the given object as an array of its own keyof type,
 * ensuring the keys are typed according to the keys actually present in `O`.
 *
 * @template O - The object type from which keys are extracted.
 * @param obj - The object whose keys are to be retrieved.
 * @returns An array of keys of the object `O`.
 */
export function objectKeys<O extends object>(obj: O): (keyof O)[] {
  return Object.keys(obj) as (keyof O)[];
}

/**
 * The database instance.
 */
export interface AppDb<T extends Record<string, unknown>> {
  /**
   * The database's Drizzle ORM instance.
   */
  orm: PostgresJsDatabase<T> & {
    session: {
      client: SQL<T>;
    };
  };

  /**
   * The database's schemas.
   */
  schema: T;

  /**
   * The database's URL.
   */
  url: string;
}

/**
 * The database error class.
 */
export class DatabaseError extends Error {
  fieldErrors!: Record<string, string[] | undefined>;

  constructor(
    message: string,
    fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);

    if (fieldErrors) {
      this.fieldErrors = fieldErrors;
    }
  }
}

/**
 * The options for finding the first record.
 */
export type FindFirstOpts<T extends Record<string, unknown>> = KnownKeysOnly<
  T,
  FindFirstQueryConfig<T, keyof ExtractTablesWithRelations<T>>
>;

/**
 * The options for finding many records.
 */
export type FindManyOpts<T extends Record<string, unknown>> = KnownKeysOnly<
  T,
  FindManyQueryConfig<T, keyof ExtractTablesWithRelations<T>>
>;

/**
 * The options for paginating the records by offset.
 */
export type PaginateByOffsetOpts<T extends Record<string, unknown>> =
  KnownKeysOnly<
    T,
    PaginateByOffsetQueryConfig<T, keyof ExtractTablesWithRelations<T>>
  >;

/**
 * The find first query builder config.
 */
export type FindFirstQueryConfig<
  T extends Record<string, unknown>,
  U extends keyof ExtractTablesWithRelations<T>,
> = Omit<
  DBQueryConfig<
    "many",
    true,
    ExtractTablesWithRelations<T>,
    ExtractTablesWithRelations<T>[U]
  >,
  "limit"
> & {
  tx?: Transaction<T>;
};

/**
 * The find many query builder config.
 */
export type FindManyQueryConfig<
  T extends Record<string, unknown>,
  U extends keyof ExtractTablesWithRelations<T>,
> = DBQueryConfig<
  "many",
  true,
  ExtractTablesWithRelations<T>,
  ExtractTablesWithRelations<T>[U]
> & {
  tx?: Transaction<T>;
};

/**
 * The paginate by offset query builder config.
 */
export type PaginateByOffsetQueryConfig<
  T extends Record<string, unknown>,
  U extends keyof ExtractTablesWithRelations<T>,
> = Omit<
  DBQueryConfig<
    "many",
    true,
    ExtractTablesWithRelations<T>,
    ExtractTablesWithRelations<T>[U]
  > & {
    page?: number;
    perPage?: number;
    sortBy?: keyof ExtractTablesWithRelations<T>[U]["columns"];
    orderBy?: "asc" | "desc";
    tx?: Transaction<T>;
  },
  "limit" | "offset"
>;

/**
 * The generic transaction session.
 */
export type Transaction<T extends Record<string, unknown>> = SQLiteTransaction<
  PostgresJsQueryResultHKT,
  T,
  ExtractTablesWithRelations<T>
>;

type SimplifyShallow<T> = {
  [K in keyof T]: T[K];
} & {};

type SelectResultField<
  T,
  TDeep extends boolean = true,
> = T extends DrizzleTypeError<any>
  ? T
  : T extends AnyTable<any>
    ? Equal<TDeep, true> extends true
      ? SelectResultField<T["_"]["columns"], false>
      : never
    : T extends AnyColumn
      ? GetColumnData<T>
      : T extends SQL | SQL.Aliased
        ? T["_"]["type"]
        : T extends Record<string, any>
          ? SelectResultFields<T, true>
          : never;

type SelectResultFields<
  TSelectedFields,
  TDeep extends boolean = true,
> = SimplifyShallow<{
  [Key in keyof TSelectedFields & string]: SelectResultField<
    TSelectedFields[Key],
    TDeep
  >;
}>;

export type Transaction = SQLiteTransaction<
  "sync" | "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

type TxOrDb = Transaction | Database;

type TransactionContextType = {
  tx: Transaction;
  effects: Array<() => void>;
};

// export interface IBaseRepository<
//   TTable extends SQLiteTable,
//   TNew extends InferInsert<TTable> = InferInsert<TTable>,
//   TDetail extends InferSelect<TTable> = InferSelect<TTable>,
// > {
//   getById(params: { id: number | string }): Promise<TDetail | undefined>;
//   create(params: TNew): Promise<TDetail | undefined>;
//   createMany(params: TNew[]): Promise<TDetail[]>;
// }

type InferInsert<T extends SQLiteTable> = v.InferOutput<
  ReturnType<typeof createInsertSchema<T>>
>;

type InferSelect<T extends SQLiteTable> = v.InferOutput<
  ReturnType<typeof createSelectSchema<T>>
>;

type ExtractTableNames<
  TSchema extends Record<string, SQLiteTableWithColumns<TConfig>>,
  TConfig extends TableConfig = TableConfig,
> = keyof ExtractTablesWithRelations<TSchema>;

export abstract class BaseRepository<
  TSchema extends Record<string, SQLiteTableWithColumns<TConfig>>,
  TTable extends SQLiteTable,
  TInsert extends InferInsert<TTable> = InferInsert<TTable>,
  TSelect extends InferSelect<TTable> = InferSelect<TTable>,
  TConfig extends TableConfig = TableConfig,
> {
  table: TTable;
  tableConfig: ReturnType<typeof getTableConfig<TTable>>;

  #db: Database;
  #schema: TSchema;
  #storage: AsyncLocalStorage<TransactionContextType>;

  constructor(db: Database, tableName: ExtractTableNames<TSchema>) {
    this.table = table;
    this.tableConfig = getTableConfig(table);

    this.#db = db;
    this.#storage = new AsyncLocalStorage();
  }
}

export abstract class Repository<
  T extends Record<string, unknown>,
  U extends SQLiteTableWithColumns<any>,
  V extends keyof ExtractTablesWithRelations<T>,
> {
  /**
   * The DB instance.
   */
  db: AppDb<T>;

  /**
   * The DB table.
   */
  table: U;

  /**
   * The DB model name.
   */
  #modelName!: keyof ExtractTablesWithRelations<T>;

  /**
   * The DB table relations.
   */
  #relations: Record<string, Relation>;

  constructor(db: AppDb<T>, table: U) {
    this.db = db;
    this.table = table;

    Object.getOwnPropertySymbols(table).map((k) => {
      if (k.toString() === "Symbol(drizzle:Name)") {
        // Replace graphile-worker's table prefix.
        this.#modelName = camelCase(
          table[k as unknown as string].replace("_private_", ""),
        ) as keyof ExtractTablesWithRelations<T>;
      }
    });

    // @ts-expect-error
    this.#relations = this.db.schema[`${this.#modelName}Relations`].config(
      createTableRelationsHelpers(this.table),
    );
  }

  get columns() {
    return objectKeys(getTableColumns(this.table));
  }

  /**
   * Asynchronously invalidates the storage cache/object for the provided rows.
   *
   * @param {Array<InferSelectModel<T>>} rows The rows to be checked for
   * cache/object invalidation.
   * @returns {Promise<any>} A promise that resolves once all relevant
   * cache/object entries have been invalidated.
   * @private
   */
  async #cleanUpStorage(rows: Array<InferSelectModel<U>>): Promise<any> {
    const promises: Promise<any>[] = [];

    rows.map((row) => {
      Object.values(row).map((value) => {
        if (
          value &&
          typeof value === "object" &&
          "key" in value &&
          "name" in value &&
          "url" in value &&
          value.key
        ) {
          // promises.push(cache.expire(CACHE_KEYS.storage(value.key)));
          // promises.push(storage.delete(value.key));
        }
      });
    });

    await Promise.all(promises);
  }

  /**
   * Get the Sentry's tracing span attributes.
   *
   * @returns {StartSpanOptions} The Sentry options to start a tracing span.
   */
  #getSentryAttributes(): Partial<StartSpanOptions> {
    return {
      attributes: {
        "db.system": "postgresql",
      },
      op: "db.query",
    };
  }

  /**
   * Convert the unknown error to DatabaseError class with best efforts.
   *
   * @param {unknown} err The unknown error.
   * @returns {unknown | DatabaseError}
   */
  #toDatabaseError(err: unknown): unknown | DatabaseError {
    /**
     * Refer to the errors list at https://github.com/rails/rails/blob/main/activerecord/lib/active_record/connection_adapters/postgresql_adapter.rb#L769.
     */
    if (err instanceof postgres.PostgresError) {
      switch (err.code) {
        case "23505": {
          const keyRegex = /Key \(([^=]+)\)=/;
          const valueRegex = /=\(([^)]+)\)/;
          const keyMatch = err.detail?.match(keyRegex);
          const valueMatch = err.detail?.match(valueRegex);

          if (keyMatch && valueMatch) {
            const keys = keyMatch[1].split(", ").map((key) => key.trim());
            const values = valueMatch[1]
              .split(", ")
              .map((value) => value.trim());
            const fieldErrors: Record<string, string[]> = {};
            const isComposite = keys.length > 1;

            // TODO: Finish up composite key error handling.
            // keys.forEach((key, _idx) => {
            // 	fieldErrors[
            // 		`${pluralize.singular(this.#tableName)}.${camel(key)}`
            // 	] = [
            // 		isComposite
            // 			? "app:errors.dbUniqueCompositeConstraint"
            // 			: "app:errors.dbUniqueConstraint",
            // 	] satisfies I18nKeys[];
            // });

            return new DatabaseError(err.message, fieldErrors);
          }
        }
      }
    }

    return err;
  }

  /**
   * A hook that is invoked right before a row is inserted.
   *
   * @param {SQLiteInsertValue<U>} row
   * @returns {Promise<void>}
   */
  abstract beforeCreate(row: SQLiteInsertValue<U>): Promise<void>;

  /**
   * A hook that is invoked after a row is inserted and right before returning to the caller.
   *
   * @param {InferSelectModel<U>} row
   * @returns {Promise<InferSelectModel<U>>}
   */
  abstract afterCreate(row: InferSelectModel<U>): Promise<InferSelectModel<U>>;

  /**
   * A hook that is invoked after a row is deleted and right before returning to the caller.
   *
   * @param {InferSelectModel<U>} row
   * @returns {Promise<void>}
   */
  abstract afterDelete(row: InferSelectModel<U>): Promise<void>;

  /**
   * A hook that is invoked right before returning to the caller which applies to:
   *
   * - findFirst()
   * - findMany()
   * - paginateByOffset()
   *
   * The common use cases:
   *
   * - post process s3 storage path to a private s3 URL and cache it
   *
   * @param {InferSelectModel<U>} row
   * @returns {Promise<void>}
   */
  abstract afterFind(row: InferSelectModel<U>): Promise<void>;

  /**
   * A hook that is invoked right before a row is updated.
   *
   * @param {SQLiteUpdateSetSource<U>} row
   * @returns {Promise<void>}
   */
  abstract beforeUpdate(row: SQLiteUpdateSetSource<U>): Promise<void>;

  /**
   * A hook that is invoked after a row is updated and right before returning to the caller.
   *
   * @param {InferSelectModel<U>} row
   * @returns {Promise<void>}
   */
  abstract afterUpdate(row: InferSelectModel<U>): Promise<void>;

  /**
   * Insert 1 value into the database.
   *
   * @param value The values to insert.
   * @param [opts] The insert options.
   * @param [opts.columns] The fields to return.
   * @param [opts.tx] The SQL transaction.
   * @returns
   */
  async create<TSelectedFields extends SelectedFieldsFlat>(
    value: SQLiteInsertValue<U>,
    opts: {
      columns: TSelectedFields;
      onConflictDoNothing?: {
        target?: IndexColumn | IndexColumn[];
      };
      onConflictDoUpdate?: SQLiteInsertOnConflictDoUpdateConfig<
        SQLiteInsertBase<U, PostgresJsQueryResultHKT, undefined, false, never>
      >;
      tx?: Transaction<T>;
    },
  ): Promise<SelectResultFields<TSelectedFields> | null>;
  async create(
    value: SQLiteInsertValue<U>,
    opts?: {
      onConflictDoNothing?: {
        target?: IndexColumn | IndexColumn[];
      };
      onConflictDoUpdate?: SQLiteInsertOnConflictDoUpdateConfig<
        SQLiteInsertBase<U, PostgresJsQueryResultHKT, undefined, false, never>
      >;
      tx?: Transaction<T>;
    },
  ): Promise<InferSelectModel<U> | null>;
  async create<TSelectedFields extends SelectedFieldsFlat | undefined>(
    value: SQLiteInsertValue<U>,
    opts?: {
      columns?: TSelectedFields;
      onConflictDoNothing?: {
        target?: IndexColumn | IndexColumn[];
      };
      onConflictDoUpdate?: SQLiteInsertOnConflictDoUpdateConfig<
        SQLiteInsertBase<U, PostgresJsQueryResultHKT, undefined, false, never>
      >;
      tx?: Transaction<T>;
    },
  ) {
    try {
      await this.beforeCreate(value);
      const qb = (opts?.tx || this.db.orm).insert(this.table).values(value);

      if (opts?.onConflictDoUpdate) {
        qb.onConflictDoUpdate({
          ...opts.onConflictDoUpdate,
          ...(Object.keys(this.table).includes("updatedAt")
            ? {
                set: {
                  ...opts.onConflictDoUpdate.set,
                  updatedAt: sql`NOW()`,
                },
              }
            : {}),
        });
      } else if (opts?.onConflictDoNothing) {
        qb.onConflictDoNothing(opts.onConflictDoNothing);
      }

      if (opts && "columns" in opts) {
        qb.returning(opts.columns as SelectedFieldsFlat);
      } else {
        qb.returning();
      }

      const rows = await startSpan(
        {
          ...this.#getSentryAttributes(),
          name: qb.toSQL().sql,
        },
        async () => qb,
      );

      if (rows.length < 1) {
        return null;
      }

      await this.afterCreate(rows[0]);

      return rows[0];
    } catch (err) {
      throw this.#toDatabaseError(err);
    }
  }

  /**
   * Insert many values into the database.
   *
   * @param values The values to insert.
   * @param [opts] The insert options.
   * @param [opts.columns] The columns to return.
   * @param [opts.tx] The SQL transaction.
   * @returns The inserted rows.
   */
  async createMany<TSelectedFields extends SelectedFieldsFlat>(
    value: SQLiteInsertValue<U>[],
    opts: {
      columns: TSelectedFields;
      tx?: Transaction<T>;
    },
  ): Promise<SelectResultFields<TSelectedFields>[]>;
  async createMany(
    value: SQLiteInsertValue<U>[],
    opts?: { tx?: Transaction<T> },
  ): Promise<InferSelectModel<U>[]>;
  async createMany<TSelectedFields extends SelectedFieldsFlat>(
    values: SQLiteInsertValue<U>[],
    opts?: {
      columns?: TSelectedFields;
      tx?: Transaction<T>;
    },
  ) {
    try {
      const qb = (opts?.tx || this.db.orm).insert(this.table).values(
        await Promise.all(
          values
            .map((value) => {
              return async () => {
                await this.beforeCreate(value);

                return value;
              };
            })
            .map((v) => v()),
        ),
      );

      if (opts?.columns) {
        qb.returning(opts?.columns);
      } else {
        qb.returning();
      }

      const rows = await startSpan(
        {
          ...this.#getSentryAttributes(),
          name: qb.toSQL().sql,
        },
        async () => qb,
      );

      if (rows.length < 1) {
        return [];
      }

      await Promise.all(rows.map(async (row) => this.afterCreate(row)));

      return rows;
    } catch (err) {
      throw this.#toDatabaseError(err);
    }
  }

  /**
   * Delete the data rows in the database based on the where condition.
   *
   * @param [opts] The insert options.
   * @param [opts.columns] The columns to return.
   * @param [opts.where] The SQL where filter.
   * @param [opts.tx] The SQL transaction.
   * @returns The deleted rows.
   */
  async delete<
    TSelectedFields extends SelectedFieldsFlat,
    QConfig extends FindManyQueryConfig<T, V>,
  >(opts: {
    columns: TSelectedFields;
    where?: QConfig["where"];
    tx?: Transaction<T>;
  }): Promise<SelectResultFields<TSelectedFields>[] | null>;
  async delete<QConfig extends FindManyQueryConfig<T, V>>(opts?: {
    where?: QConfig["where"];
    tx?: Transaction<T>;
  }): Promise<InferSelectModel<U>[] | null>;
  async delete<
    TSelectedFields extends SelectedFieldsFlat,
    QConfig extends FindManyQueryConfig<T, V>,
  >(opts?: {
    columns?: TSelectedFields;
    where?: QConfig["where"];
    tx?: Transaction<T>;
  }) {
    let where;
    if (opts?.where) {
      if ("queryChunks" in opts.where) {
        where = opts.where;
      } else if (typeof opts.where === "function") {
        where = opts.where(getTableColumns(this.table), getOperators());
      }
    }

    const deletingRows = await this.findMany({ where, tx: opts?.tx });
    if (deletingRows.length > 0) {
      await this.#cleanUpStorage(deletingRows);
    }

    const qb = (opts?.tx || this.db.orm).delete(this.table).where(where);

    if (opts?.columns) {
      qb.returning(opts?.columns);
    } else {
      qb.returning();
    }

    const rows = await startSpan(
      {
        ...this.#getSentryAttributes(),
        name: qb.toSQL().sql,
      },
      async () => qb,
    );

    if (rows.length < 1) {
      return [];
    }

    await Promise.all(rows.map(async (row) => this.afterDelete(row)));

    return rows;
  }

  /**
   * Return the 1st record based on the config.
   *
   * @param [opts] The find many options with pagination.
   * @param [opts.columns] The columns to select.
   * @param [opts.extras] The extras columns to return.
   * @param [opts.offset] The offset of the returned rows.
   * @param [opts.orderBy] The sorting order.
   * @param [opts.where] The where filter.
   * @param [opts.with] The relations to include in query.
   * @param [opts.tx] The SQL transaction.
   * @returns
   */
  async findFirst<QConfig extends FindFirstQueryConfig<T, V>>(
    opts?: FindFirstOpts<QConfig>,
  ) {
    const { tx, ...config } = opts || {};
    const qb = tx || this.db.orm;
    const row = await startSpan(
      {
        ...this.#getSentryAttributes(),
        // @ts-expect-error
        name: qb.query[this.#modelName].findFirst(config || {}).toSQL().sql,
      },
      // @ts-expect-error
      async () => qb.query[this.#modelName].findFirst(config || {}),
    );

    if (!row) {
      return null;
    }

    await this.afterFind(row);

    return row as BuildQueryResult<
      ExtractTablesWithRelations<T>,
      ExtractTablesWithRelations<T>[V],
      QConfig
    >;
  }

  /**
   * Return all the records based on the config.
   *
   * @param [opts] The find many options.
   * @param [opts.columns] The columns to select.
   * @param [opts.extras] The extras columns to return.
   * @param [opts.limit] The limit number of the returned rows.
   * @param [opts.offset] The offset of the returned rows.
   * @param [opts.orderBy] The sorting order.
   * @param [opts.where] The where filter.
   * @param [opts.with] The relations to include in query.
   * @param [opts.tx] The SQL transaction.
   * @returns
   */
  async findMany<QConfig extends FindManyQueryConfig<T, V>>(
    opts?: FindManyOpts<QConfig>,
  ) {
    const { tx, ...config } = opts || {};
    const qb = tx || this.db.orm;
    const rows = await startSpan(
      {
        ...this.#getSentryAttributes(),
        // @ts-expect-error
        name: qb.query[this.#modelName].findMany(config || {}).toSQL().sql,
      },
      // @ts-expect-error
      async () => qb.query[this.#modelName].findMany(config || {}),
    );

    if (!rows || rows.length < 1) {
      return [];
    }

    await Promise.all(
      rows
        .map((row: InferSelectModel<U>) => async () => {
          return this.afterFind(row);
        })
        .map((v: () => Promise<void>) => v()),
    );

    return rows as unknown as BuildQueryResult<
      ExtractTablesWithRelations<T>,
      ExtractTablesWithRelations<T>[V],
      QConfig
    >[];
  }

  /**
   * Return the paginated records based on the config.
   *
   * @param [opts] The find many options with pagination.
   * @param [opts.columns] The columns to select.
   * @param [opts.extras] The extras columns to return.
   * @param [opts.orderBy] The order by SQL. Can be overwritten by sortBy.
   * @param [opts.sortBy] The sorting column.
   * @param [opts.sortDirection] The sorting direction.
   * @param [opts.where] The where filter.
   * @param [opts.with] The relations to include in query.
   * @param [opts.page=1] The current page.
   * @param [opts.perPage=10] The current page size.
   * @param [opts.tx] The SQL transaction.
   * @returns
   */
  async paginateByOffset<QConfig extends PaginateByOffsetQueryConfig<T, V>>(
    opts?: PaginateByOffsetOpts<QConfig>,
  ) {
    const {
      page = 1,
      perPage = 10,
      sortBy,
      orderBy: sortDirection = "asc",
      ...config
    } = opts || {
      columns: undefined,
      extras: undefined,
      orderBy: undefined,
      tx: undefined,
      where: undefined,
      with: undefined,
    };
    const qb = config.tx || this.db.orm;

    let countWhere: SQL<unknown> | undefined;
    if (config.where) {
      if ("queryChunks" in config.where) {
        countWhere = config.where;
      } else if (typeof config.where === "function") {
        countWhere = config.where(getTableColumns(this.table), getOperators());
      }
    }

    if (sortBy) {
      config.orderBy =
        sortDirection === "asc"
          ? [
              asc(
                this.table[sortBy as keyof (typeof this.table)["_"]["columns"]],
              ),
            ]
          : [
              desc(
                this.table[sortBy as keyof (typeof this.table)["_"]["columns"]],
              ),
            ];
    }

    const [rows, totals] = await startSpan(
      {
        ...this.#getSentryAttributes(),
        name: qb
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(this.table)
          .where(countWhere)
          .toSQL().sql,
      },
      async () =>
        Promise.all([
          this.findMany({
            ...config,
            offset: (page - 1) * perPage,
            limit: perPage + 1,
          }),
          qb
            .select({ count: sql<number>`count(*)`.mapWith(Number) })
            .from(this.table)
            .where(countWhere),
        ]),
    );

    const totalRows = totals?.[0]?.count;
    const next = rows.length > perPage;
    if (next) {
      rows.pop();
    }

    return {
      rows,
      next,
      previous: page > 1,
      page,
      perPage,
      totalPages: Math.ceil(totalRows / perPage),
      totalRows,
    };
  }

  /**
   * Update the data rows in the database based on the where condition.
   *
   * @param value The values to update to.
   * @param [opts] The insert options.
   * @param [opts.columns] The fields to return.
   * @param [opts.where] The SQL where filter.
   * @param [opts.tx] The SQL transaction.
   * @returns
   */
  async update<
    TSelectedFields extends SelectedFieldsFlat,
    QConfig extends FindManyQueryConfig<T, V>,
  >(
    value: SQLiteUpdateSetSource<U>,
    opts: {
      columns: TSelectedFields;
      where?: QConfig["where"];
      tx?: Transaction<T>;
    },
  ): Promise<SelectResultFields<TSelectedFields>[]>;
  async update<QConfig extends FindManyQueryConfig<T, V>>(
    value: SQLiteUpdateSetSource<U>,
    opts?: {
      where?: QConfig["where"];
      tx?: Transaction<T>;
    },
  ): Promise<InferSelectModel<U>[]>;
  async update<
    TSelectedFields extends SelectedFieldsFlat,
    QConfig extends FindManyQueryConfig<T, V>,
  >(
    value: SQLiteUpdateSetSource<U>,
    opts?: {
      columns?: TSelectedFields;
      where?: QConfig["where"];
      tx?: Transaction<T>;
    },
  ) {
    try {
      let where;
      if (opts?.where) {
        if ("queryChunks" in opts.where) {
          where = opts.where;
        } else if (typeof opts.where === "function") {
          where = opts.where(getTableColumns(this.table), getOperators());
        }
      }

      await this.beforeUpdate(value);
      const qb = (opts?.tx || this.db.orm)
        .update(this.table)
        .set({
          ...value,
          ...(Object.keys(this.table).includes("updatedAt")
            ? { updatedAt: sql`NOW()` }
            : {}),
        })
        .where(where);

      if (opts?.columns) {
        qb.returning(opts?.columns);
      } else {
        qb.returning();
      }

      const rows = await startSpan(
        {
          ...this.#getSentryAttributes(),
          name: qb.toSQL().sql,
        },
        async () => qb,
      );

      if (rows.length < 1) {
        return [];
      }

      await Promise.all(rows.map((row) => this.afterUpdate(row)));

      return rows;
    } catch (err) {
      throw this.#toDatabaseError(err);
    }
  }
}
