Rails.application.routes.draw do
  #Mount the Action Cable Server => config/routes.rb
  mount ActionCable.server => '/cable'
  root 'pages#home'
end
