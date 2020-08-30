import { App } from './app/App'
import { container } from './app/inversify.config'

// app.clearConsole();
container.get(App).init();
// App.init();