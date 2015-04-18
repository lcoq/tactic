Rails.application.routes.draw do
  scope '/api' do
    resources :entries, only: [:index]
    resources :projects, only: [:index]
  end
end
