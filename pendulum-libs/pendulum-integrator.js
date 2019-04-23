class PendulumIntegrator 
{

  constructor(user_config={})
  {

    // default configuration
    let config = {
      friction: 1.0,
      driving_force: 1.0,
      natural_frequency: 1.0,
      driving_frequency: 2.0*Math.PI,
      dt: 0.05,
      initial_position: -Math.PI/2,
      initial_velocity: 0
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    this.friction = config.friction;
    this.driving_force = config.driving_force;
    this.natural_frequency = config.natural_frequency;
    this.driving_frequency = config.driving_frequency;
    this.dt = config.dt;
    this.initial_position = config.initial_position;
    this.initial_velocity = config.initial_velocity;

    // initialize ODE integrator
    this.equation_of_motions = null;
    this.reset_ode();
  }

  reset_ode(user_config={})
  {

    // default configuration
    let config = {
      h: null,
      tol: null,
      dt: null
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    this.ode = new rk45();
    
    if (config.h === null)
      config.h = this.dt / 10;
    this.ode.setH(config.h);

    if (config.tol !== null)
      this.ode.setTol(config.tol);
    if (config.dt !== null)
      this.dt = config.dt;

    this.ode.setInitX([this.initial_position, this.initial_velocity]);
    this.ode.setStart(0.0);
    this.ode.setFn(this.get_equations_of_motion());

  }

  set_parameters(user_config={})
  {
    let config = {
      friction: null,
      driving_force: null,
      natural_frequency: null,
      driving_frequency: null
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    if (config.friction !== null)
      this.friction = config.friction;
    if (config.driving_force !== null)
      this.driving_force = config.driving_force;
    if (config.natural_frequency !== null)
      this.natural_frequency = config.natural_frequency;
    if (config.driving_frequency !== null)
      this.driving_frequency = config.driving_frequency;
  }

  set_initial_values(x0)
  {
    this.initial_position = x0[0];
    this.initial_velocity = x0[1];
  }

  get_equations_of_motion()
  {
    let fn = [];
    let self = this;

    fn[0] = function(time, x) {
      return x[1];
    }

    fn[1] = function(time, x) {
      let w2 = Math.pow(self.natural_frequency,2);
      return - 2 * self.friction*x[1] - w2 * Math.sin(x[0]) + self.driving_force * w2 * Math.cos(self.driving_frequency * time);
    };

    this.equations_of_motion = fn;

    return fn;
  }

  get_next_result()
  {
    this.ode.setStop(this.ode.start + this.dt);
    this.ode.solve();
    let phi = this.ode.newX[0];
    let p = this.ode.newX[1];
    this.ode.adoptCurrentState();

    return {t: this.ode.start, x: phi, xdot: p};
  }

}
