class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.timestamps null: false
    end
    add_column :entries, :user_id, :integer
    add_index :entries, :user_id
  end
end
