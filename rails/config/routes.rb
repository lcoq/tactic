Rails.application.routes.draw do
  scope '/api' do
    resources :entries, only: [:create, :update, :index]
    resources :projects, only: [:index]
  end
end
