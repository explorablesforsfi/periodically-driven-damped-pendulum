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
      plot_width: 300,
      plot_height: 200,
      integrator_config: {}
    }

    // overwrite default configuration with user configuration
    Reflect.ownKeys(user_config).forEach(function(key){
      config[key] = user_config[key];
    });

    this.draw_pendulum = (config.pendulum_div !== null);
    this.plot_pendulum = (config.plot_div !== null);

    this.pendulum_width = config.pendulum_width;
    this.pendulum_height = config.pendulum_height;
    this.plot_width = config.plot_width;
    this.plot_height = config.plot_height;

    if (this.draw_pendulum)
      this.init_draw_canvas(config.pendulum_div);
    if (this.plot_pendulum)
      this.init_plot_canvas(config.plot_div);

    this.init_plot();
    this.init_draw();
    this.reset_observables();

    this.integrator_config = config.integrator_config;
    this.timer = null;

    this.pendulum_integrator = new PendulumIntegrator(this.integrator_config);


  }

  start()
  {
    let self = this;

    this.timer = d3.timer( function(elapsed){

      let res = self.pendulum_integrator.get_next_result();
      self.time.push(res.t);
      self.phi.push(res.x);

      if (self.draw_pendulum)
        self.draw_update();
      if (self.plot_pendulum)
        self.plot_update();

    });
  }

  stop()
  {
    this.timer.stop();
  }

  draw_update()
  {
    let w = this.pendulum_width;
    let h = this.pendulum_height
    this.draw_ctx.clearRect(0,0,w,h);
    let L = h/4;
    let x0 = w/2; 
    let y0 = h/2;
    let r = w/32;
    let rsmall = r/2;
    let phi = this.phi[this.phi.length-1];
    let x1 =  L*Math.cos(phi-Math.PI/2) + x0;
    let y1 = -L*Math.sin(phi-Math.PI/2) + y0;

    let ctx = this.draw_ctx;

    ctx.beginPath();
    ctx.lineWidth = rsmall/2;
    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1 + r, y1);
    ctx.arc(x1, y1, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x0 + rsmall/2, y0);
    ctx.arc(x0, y0, rsmall/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

  }

  plot_update()
  {
    this.pl.plot("trajectory",this.time, this.phi);
  }

  init_draw_canvas(div)
  {
    // create canvas DOM and context to draw on 
    this.draw_canv = d3.select(div)
                   .append('canvas')
                   .attr('width', this.pendulum_width)
                   .attr('height', this.pendulum_height);
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
                             {  
                               margin:30,
                               fontsize:14
                             });
  }

  init_draw()
  {
  }

  reset_observables()
  {
    this.time = [];
    this.phi = [];
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
