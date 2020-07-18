defmodule ChatApiWeb.Router do
  use ChatApiWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug(:accepts, ["json"])
    plug(ChatApiWeb.APIAuthPlug, otp_app: :chat_api)
  end

  pipeline :api_protected do
    plug(Pow.Plug.RequireAuthenticated, error_handler: ChatApiWeb.APIAuthErrorHandler)
  end

  # Public routes
  scope "/api", ChatApiWeb do
    pipe_through(:api)

    resources("/registration", RegistrationController, singleton: true, only: [:create])
    resources("/session", SessionController, singleton: true, only: [:create, :delete])
    post("/session/renew", SessionController, :renew)

    post("/accounts", AccountController, :create)
    post("/conversations", ConversationController, :create)
    post("/customers", CustomerController, :create)

    # TODO: figure out a better name?
    get("/conversations/customer", ConversationController, :find_by_customer)
  end

  # Protected routes
  scope "/api", ChatApiWeb do
    pipe_through([:api, :api_protected])

    get("/me", SessionController, :me)
    get("/accounts/me", AccountController, :me)
    get("/messages/count", MessageController, :count)

    resources("/user_invitations", UserInvitationController, except: [:new, :edit])
    resources("/accounts", AccountController, only: [:update, :delete])
    resources("/messages", MessageController, except: [:new, :edit])
    resources("/conversations", ConversationController, except: [:new, :edit, :create])
    resources("/customers", CustomerController, except: [:new, :edit, :create])
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through([:fetch_session, :protect_from_forgery])
      live_dashboard("/dashboard", metrics: ChatApiWeb.Telemetry)
    end
  end

  scope "/", ChatApiWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/*path", PageController, :index
  end
end