class CreateEntries < ActiveRecord::Migration
  def change
    create_table :entries do |t|
      t.string :title
      t.datetime :started_at, null: false
      t.datetime :finished_at, null: false
      t.timestamps null: false
    end
  end
end
