"""Peewee migrations -- 035_add_source_range_to_exports.py.

Some examples (model - class or model name)::

    > Model = migrator.orm['model_name']            # Return model in current state by name

    > migrator.sql(sql)                             # Run custom SQL
    > migrator.python(func, *args, **kwargs)        # Run python code
    > migrator.create_model(Model)                  # Create a model (could be used as decorator)
    > migrator.remove_model(model, cascade=True)    # Remove a model
    > migrator.add_fields(model, **fields)          # Add fields to a model
    > migrator.change_fields(model, **fields)       # Change fields
    > migrator.remove_fields(model, *field_names, cascade=True)
    > migrator.rename_field(model, old_field_name, new_field_name)
    > migrator.rename_table(model, new_table_name)
    > migrator.add_index(model, *col_names, unique=False)
    > migrator.drop_index(model, *col_names)
    > migrator.add_not_null(model, *field_names)
    > migrator.drop_not_null(model, *field_names)
    > migrator.add_default(model, field_name, default)

"""

import peewee as pw

SQL = pw.SQL


def migrate(migrator, database, fake=False, **kwargs):
    # Add nullable source range columns to export table
    migrator.sql('ALTER TABLE "export" ADD COLUMN "source_type" VARCHAR(30) NULL')
    migrator.sql('ALTER TABLE "export" ADD COLUMN "source_start_time" REAL NULL')
    migrator.sql('ALTER TABLE "export" ADD COLUMN "source_end_time" REAL NULL')
    migrator.sql('ALTER TABLE "export" ADD COLUMN "source_review_id" VARCHAR(30) NULL')

    # Composite index for the range lookup query pattern:
    #   camera + source_start_time + source_end_time
    migrator.sql(
        'CREATE INDEX IF NOT EXISTS "export_source_range" ON "export" '
        '("camera", "source_start_time", "source_end_time")'
    )


def rollback(migrator, database, fake=False, **kwargs):
    pass
