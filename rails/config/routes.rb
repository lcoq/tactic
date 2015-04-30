Rails.application.routes.draw do
  scope '/api' do
    resources :entries, only: [:create, :update, :destroy, :index]
    resources :projects, only: [:index]
    resources :users, only: [:index]
  end
end
