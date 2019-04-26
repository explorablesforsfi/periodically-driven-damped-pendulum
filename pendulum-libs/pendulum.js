class Pendulum 
{
  constructor(user_config={})
  {

    // default configuration
    let config = {
      pendulum_div: null,
      plot_div: null,
      pendulum_width: 200,
      pendulum_height: 200,
      phase_space: 'non-periodic',
      plot_width: 300,
      plot_height: 200,
      integrator_config: {},
      draw_driver: false,
      draw_friction: false,
      plot_config: {
        margin: 14,
        fontsize: 12
      },
      update_callback: function () {}
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    this.integrator_config = config.integrator_config;
    this.pendulum_integrator = new PendulumIntegrator(this.integrator_config);
    this.timer = null;

    this.draw_pendulum = (config.pendulum_div !== null);
    this.plot_pendulum = (config.plot_div !== null);

    this.pendulum_width = config.pendulum_width;
    this.pendulum_height = config.pendulum_height;
    this.plot_width = config.plot_width;
    this.plot_height = config.plot_height;
    this.plot_config = config.plot_config;
    this.draw_driver = config.draw_driver;
    this.draw_friction = config.draw_friction;
    this.phase_space = config.phase_space;
    this.update_callback = config.update_callback;

    this.is_running = false;
    this.reset_observables();

    if (this.draw_pendulum)
    {
      this.init_draw_canvas(config.pendulum_div);
      this.init_draw();
      this.draw_update();
    }
    if (this.plot_pendulum)
    {
      this.init_plot_canvas(config.plot_div);
      this.init_plot();
      this.plot_update();
    }





  }

  start()
  {
    let self = this;
    this.is_running = true;

    this.timer = d3.timer( function(elapsed){

      let res = self.pendulum_integrator.get_next_result();
      let phi = res.x;
      self.time.push(res.t);
      self.phi.push(phi);
      if (self.phase_space == 'periodic')
      {
        while (phi>Math.PI)
          phi -= 2*Math.PI;
        while (phi<=-Math.PI)
          phi += 2*Math.PI;
        self.periodic_phi.push(phi);
      }
      self.phidot.push(res.xdot);

      if (self.draw_pendulum)
        self.draw_update();
      if (self.plot_pendulum)
        self.plot_update();

      self.update_callback();

    });
  }

  stop()
  {
    this.timer.stop();
    this.is_running = false;
  }

  draw_update()
  {
    let ctx = this.draw_ctx;
    ctx.save();

    let w = this.pendulum_width;
    let h = this.pendulum_height

    ctx.clearRect(0,0,w,h);

    let L = h/3;
    let x0 = w/2; 
    let y0 = h/2;
    let r = w/32;
    let rsmall = r/2;
    let phi = this.phi[this.phi.length-1];
    let x1 =  L*Math.cos(phi-Math.PI/2) + x0;
    let y1 = -L*Math.sin(phi-Math.PI/2) + y0;


    if (this.draw_driver)
    {
      ctx.strokeStyle = "#f88";
      ctx.lineWidth = rsmall/2;
      ctx.beginPath();
      let gamma = this.pendulum_integrator.driving_force;
      let xF = 20*gamma*Math.cos(this.pendulum_integrator.driving_frequency*this.time[this.time.length-1]);
      xF += x0;
      ctx.moveTo(x0,y0);
      ctx.lineTo(xF,y0);
      ctx.stroke()
    }

    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.lineWidth = rsmall/2;
    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y1);
    ctx.stroke();

    ctx.lineWidth = 1.5;

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x0 + rsmall/2, y0);
    ctx.arc(x0, y0, rsmall/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    if (this.draw_friction)
    {
      let friction_color = d3.scaleLinear().range([0,255]).domain([0,1]);
      let f = 2*this.pendulum_integrator.friction;
      let friction = f*Math.abs(this.phidot[this.phidot.length-1]);
      ctx.fillStyle = "rgb("+Math.floor(friction_color(friction))+",0,0)";
      //ctx.strokeStyle = "rgb("+(255-Math.floor(friction_color(friction)))+",255,255)";
    }

    ctx.moveTo(x1 + r, y1);
    ctx.arc(x1, y1, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    this.draw_ctx.restore();

  }

  plot_update()
  {
    this.pl.plot("trajectory",this.time, this.phi);

    if (this.phase_space == 'periodic')
    {
      this.ps_pl.scatter("trajectory",this.periodic_phi, this.phidot, {markerradius:1,markeredgewidth:0}, false);
      this.ps_pl.draw_last_point("trajectory");
    }
    else
      this.ps_pl.plot("trajectory",this.phi, this.phidot);
  }

  init_draw_canvas(div)
  {
    // create canvas DOM and context to draw on 
    this.draw_canv = d3.select(div)
                   .append('canvas')
                   .attr('width', this.pendulum_width)
                   .attr('height', this.pendulum_height)
                   ;
    //d3.select(div).style("border","1px solid black")
    this.draw_ctx = this.draw_canv.node().getContext('2d');

    // adjust for retina display
    this.retina(this.draw_canv,
                this.draw_ctx,
                this.pendulum_width,
                this.pendulum_height
               );
  }

  init_plot_canvas(div)
  {
    // create canvas DOM and context to draw on 
    this.plot_canv = d3.select(div)
                   .append('canvas')
                   .attr('width', this.plot_width)
                   .attr('height', this.plot_height);
    this.plot_ctx = this.plot_canv.node().getContext('2d');

    // create canvas DOM and context to draw on 
    this.phasesp_canv = d3.select(div)
                   .append('canvas')
                   .attr('width', this.plot_width)
                   .attr('height', this.plot_height);
    this.phasesp_ctx = this.phasesp_canv.node().getContext('2d');

    // adjust for retina display
    this.retina(this.phasesp_canv,
                this.phasesp_ctx,
                this.plot_width,
                this.plot_height
               );
    // adjust for retina display
    this.retina(this.plot_canv,
                this.plot_ctx,
                this.plot_width,
                this.plot_height
               );
  }

  init_plot()
  {
    this.pl = new simplePlot(this.plot_ctx,
                             this.plot_width,
                             this.plot_height,
                             this.plot_config
                             );
    this.ps_pl = new simplePlot(this.phasesp_ctx,
                             this.plot_width,
                             this.plot_height,
                             this.plot_config
                             );
    this.pl.xlimlabels(['','']);
    this.pl.ylimlabels(['','']);
    this.pl.xlabel('time');
    this.pl.ylabel('angle');
    this.ps_pl.xlimlabels(['','']);
    this.ps_pl.ylimlabels(['','']);
    if (this.phase_space == 'periodic')
    {
      this.ps_pl.xlabel('angle (periodic)');

      this.ps_pl.xlim([-Math.PI,Math.PI])
      this.ps_pl.xlimlabels(['-π','π'])
    }
    else
      this.ps_pl.xlabel('angle');
    this.ps_pl.ylabel('angular velocity');
  }

  init_draw()
  {
  }

  reset()
  {
    this.pendulum_integrator.reset_ode();
    this.reset_observables();

    if (this.draw_pendulum)
    {
      this.init_draw();
      this.draw_update();
    }

    if (this.plot_pendulum)
    {
      this.init_plot();
      this.plot_update();
    }

  }


  reset_observables()
  {
    this.time = [0];
    this.phi = [this.pendulum_integrator.initial_position];
    this.periodic_phi = [this.pendulum_integrator.initial_position];
    this.phidot = [this.pendulum_integrator.initial_velocity];
    /*
    this.time = [];
    this.phi = [];
    this.periodic_phi = [];
    this.phidot = [];
    */
  }

  set_parameters(params)
  {
    this.pendulum_integrator.set_parameters(params);
  }

  // nicer display on retina
  retina(canv,cont,w,h)
  {
    if (window.devicePixelRatio)
    {
        canv
            .attr('width', w * window.devicePixelRatio)
            .attr('height', h * window.devicePixelRatio)
            .style('width', w + 'px')
            .style('height', h + 'px');

        cont.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }
}
