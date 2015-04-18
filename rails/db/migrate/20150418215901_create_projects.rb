class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :name, null: false
      t.timestamps null: false
    end
    add_column :entries, :project_id, :integer
    add_index :entries, :project_id
  end
end
