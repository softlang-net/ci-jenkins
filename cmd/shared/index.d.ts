// declare all types
interface AppPod {
    service_name: string;
    image_name: string;
    app_port: number;
    app_entry: string;
    app_path: string;
    app_cpus: string; // ex: 1, 1.5
    app_memory: string; // ex: 256M
    app_replicas: 1;
    max_replicas: 0, // --replicas-max-per-node Maximum number of tasks per node (default 0 = unlimited) 
    app_network: string;
}

export function deployService(pod: AppPod):string;

/*
env = {
    DOCKER_CONTEXT: ci_docker_context_deploy,
    service_name: ci_app_name,
    image_name: ci_image_name,
    app_port: ci_app_port,
    app_entry: ci_app_entry,
    app_path: ci_app_path,
    app_cpus: ci_app_cpus,
    app_memory: ci_app_memory,
    app_replicas: ci_app_replicas,
    max_replicas: 0, // --replicas-max-per-node Maximum number of tasks per node (default 0 = unlimited) 
    app_network: ci_app_network
}

deployService({ Age: 1, firstName: '', lastName: '123' })
*/