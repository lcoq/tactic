FactoryGirl.define do
  factory :project do
    sequence(:name) { |n| "Project #{n}" }
  end

  factory :entry do
    sequence(:title) { |n| "Entry #{n}" }
    sequence(:started_at) { |n| 10.days.ago.to_datetime + 1.hour + rand(60).minutes }
    after(:build) { |entry| entry.finished_at = entry.started_at + rand(10 * 60).minutes }
  end
end
