require 'test_helper'

describe Entry do
  subject { build(:entry) }

  it 'exists' do
    assert subject.present?
  end
end
