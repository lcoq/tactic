class Entry < ActiveRecord::Base
  validates :started_at, presence: true
  validates :finished_at, presence: true
  validate :finish_after_start

  private

  def finish_after_start
    if started_at && finished_at && started_at > finished_at
      errors.add(:finished_at, "cannot finish before the start")
    end
  end
end
