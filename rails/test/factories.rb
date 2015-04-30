FactoryGirl.define do

  factory :user do
    sequence(:name) { |n| "User #{n}" }
  end

  factory :project do
    sequence(:name) { |n| "Project #{n}" }
  end

  factory :entry do
    user
    sequence(:title) { |n| "Entry #{n}" }
    sequence(:started_at) { |n| 10.days.ago.to_datetime + 1.hour + rand(60).minutes }
    after(:build) { |entry| entry.finished_at = entry.started_at + rand(10 * 60).minutes }
  end
end
