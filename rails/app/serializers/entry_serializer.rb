class EntrySerializer < ActiveModel::Serializer
  has_one :project
  attributes :id, :title, :started_at, :finished_at
end
