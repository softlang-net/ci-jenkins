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

// declare all types
interface PodBio {
    name: string;
    route: {
        app_port: number;
        app_entry: string;
        app_path: string;
    }
    image: {
        name: string;
        tag: string;
        registry: string;
    }
    build: {
        docker_context: string;
        compiler_container: string;
        compiler_cmd: string; // npm build-prd / build-dev / build
        dockerfile: string;
        workspace: string;
    }
    deploy: {
        docker_context: string;
        app_network: string;
        app_cpus: string; // ex: 1, 1.5
        app_memory: string; // ex: 256M
        app_replicas: 1;
        max_replicas: 0, // --replicas-max-per-node Maximum number of tasks per node (default 0 = unlimited) 
        java_ops: string;
    }
    git: {
        git_contianer: string;
        project: string;
        branch: string;
        src_dir: string;
    }
}
export function getAppPod(): AppPod;
export function deployService(pod: PodBio): string;
export function getWork_dir(pod: AppPod): string;
export function getImage_name(pod: AppPod): string;

// declare all types
interface app_cfg {
    ci_env: string;
    ci_npm_script: string;
    ci_image_tag: string;
    ci_image_registry: string;
    ci_docker_context_deploy: string;
    ci_docker_context_build: string;
    ci_container_git: string;
    ci_container_compiler: string;
    //runtime resource config
    ci_app_cpus: number;
    ci_app_memory: string;
    ci_app_replicas: number
    ci_app_name: string;
    ci_app_port: number;
    ci_app_network: string;
    ci_app_entry: string;
    ci_app_path: string;
    // compiler config
    ci_dockerfile: string;
    ci_workspace: string;
    ci_git_project: string;
    ci_git_branch: string;
    ci_git_src_dir: string;
    // env_profile
    ci_image_name: string;
    // work_dir for source code & compiler, ${JOB_NAME}@Jenkins
    ci_work_dir: string;
}

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