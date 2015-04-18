Rails.application.routes.draw do
  scope '/api' do
    resources :entries, only: [:index]
  end
end
